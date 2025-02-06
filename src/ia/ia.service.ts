import { Injectable } from '@nestjs/common';
import { CoreMessage, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { SourceExamDateService } from 'src/source/examDates/source.examDates.service';
import { SourceScheduleService } from 'src/source/courseSessions/source.schedule.service';
import { Tools } from './tools';
import { SystemPromptService } from './systemprompt';

@Injectable()
export class IaService {
  constructor(
    private srcExamDatesService: SourceExamDateService,
    private srcScheduleService: SourceScheduleService,
    private system: SystemPromptService, 
  ) { }

  async processChatStream(prompt: string) {
    console.log(prompt);
    const systemprompt = await this.system.getSystemPrompt();
    const messages: CoreMessage[] = [];
    messages.push(
      {
        role:'system',
        content: systemprompt,
      },
      {
      role: 'user',
      content: prompt,
      }
    );
    try {
      
      const result = await generateText({
        model: openai('gpt-4o'),
        messages,
        tools: {
          getExamDates: new Tools(
            this.srcExamDatesService,
            this.srcScheduleService,
          ).getExamDatesTool,
          getCourseSessions: new Tools(
            this.srcExamDatesService,
            this.srcScheduleService,
          ).getCourseSessionsTool,
          getCourseSessionsByComission: new Tools(
            this.srcExamDatesService,
            this.srcScheduleService,
          ).getCourseSessionsByComissionTool,
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
