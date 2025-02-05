import { Injectable } from '@nestjs/common';
import { CoreMessage, generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { SourceSubjectsService } from 'src/source/subjects/source.subjects.service';
import { SourceExamDateService } from 'src/source/examDates/source.examDates.service';
import { SourceScheduleService } from 'src/source/courseSessions/source.schedule.service';
import { Tools } from './tools';

@Injectable()
export class IaService {
  constructor(
    private sourceSubService: SourceSubjectsService,
    private srcExamDatesService: SourceExamDateService,
    private srcScheduleService: SourceScheduleService,
  ) {}

  async processChatStream(prompt: string) {
    console.log(prompt);
    const messages: CoreMessage[] = [];
    messages.push({
      role: 'user',
      content: prompt,
    });
    try {
      const subjects = await this.sourceSubService.getSubjects();
      const result = await generateText({
        model: openai('gpt-4o'),
        system:
          'You will be asked for fetching final exam dates, please answer properly in coloquial spanish',
        messages,
        tools: {
          getExamDates: new Tools(this.srcExamDatesService, this.srcScheduleService).getExamDatesTool,
          getCourseSessions: new Tools(this.srcExamDatesService, this.srcScheduleService).getCourseSessionsTool,
        },
        toolChoice: 'auto',
      });
      if (result.response && result.response.messages) {
        messages.push(...result.response.messages);
      }

      console.log(
        '\x1b[36mGenerating final response with tool results...\x1b[0m',
      );
      const finalResult = await generateText({
        model: openai('gpt-4o'),
        messages,
      });
      console.log('\x1b[32m✅ Response generated successfully\x1b[0m');
      return finalResult.text;
    } catch (error: any) {
      console.error('Failed to process IA message', error);
      throw new Error(`Failed to process IA message: ${error.message}`);
    }
  }
}