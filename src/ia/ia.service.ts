import { openai } from '@ai-sdk/openai';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CoreMessage, generateText } from 'ai';
import { SourceScheduleService } from 'src/source/courseSessions/source.schedule.service';
import { SourceExamDateService } from 'src/source/examDates/source.examDates.service';
import { SourceOfficeHours } from 'src/source/officeHours/source.officeHours.service';
import { WaService } from 'src/wa/wa.service';
import { SystemPromptService } from './systemprompt';
import { Tools } from './tools';

@Injectable()
export class IaService {
  constructor(
    private srcExamDatesService: SourceExamDateService,
    private srcScheduleService: SourceScheduleService,
    private srcOfficeHours: SourceOfficeHours,
    private system: SystemPromptService,
    @Inject(forwardRef(() => WaService)) private waService: WaService,
  ) {}

  async processChatStream(prompt: string) {
    console.log(prompt);
    const systemprompt = await this.system.getSystemPrompt();
    const messages: CoreMessage[] = [
      {
        role: 'system',
        content: systemprompt,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];
    try {
      const result = await generateText({
        model: openai('gpt-4o'),
        messages,
        tools: {
          getExamDates: new Tools(
            this.srcExamDatesService,
            this.srcScheduleService,
            this.srcOfficeHours,
            this.waService,
          ).getExamDatesTool,
          getCourseSessions: new Tools(
            this.srcExamDatesService,
            this.srcScheduleService,
            this.srcOfficeHours,
            this.waService,
          ).getCourseSessionsTool,
          getCourseSessionsByComission: new Tools(
            this.srcExamDatesService,
            this.srcScheduleService,
            this.srcOfficeHours,
            this.waService,
          ).getCourseSessionsByComissionTool,
          getOfficeByDepartmentTool: new Tools(
            this.srcExamDatesService,
            this.srcScheduleService,
            this.srcOfficeHours,
            this.waService,
          ).getOfficeByDepartmentTool,
          getCourseSessionsByCourseCodeTool: new Tools(
            this.srcExamDatesService,
            this.srcScheduleService,
            this.srcOfficeHours,
            this.waService,
          ).getCourseSessionsByCourseCodeTool,
          getCourseSessionsByTerm: new Tools(
            this.srcExamDatesService,
            this.srcScheduleService,
            this.srcOfficeHours,
            this.waService,
          ).getCourseSessionsByTermTool,
        },
        toolChoice: 'required',
        temperature: 0,
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
        temperature: 0,
      });
      console.log('\x1b[32m✅ Response generated successfully\x1b[0m');
      messages.push(...finalResult.response.messages);
      return finalResult.text;
    } catch (error: any) {
      console.error('Failed to process IA message', error);
      throw new Error(`Failed to process IA message: ${error.message}`);
    }
  }
}
