import { openai } from '@ai-sdk/openai';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CoreMessage, generateText } from 'ai';
//import { ollama } from 'ollama-ai-provider';
//import { groq } from '@ai-sdk/groq';
import { SourceScheduleService } from 'src/source/courseSessions/source.schedule.service';
import { SourceExamDateService } from 'src/source/examDates/source.examDates.service';
import { SourceOfficeHours } from 'src/source/officeHours/source.officeHours.service';
import { SourceTelephoneService } from 'src/source/telephones/source.telephones.service';
import { WaService } from 'src/wa/wa.service';
import { SystemPromptService } from './systemprompt';
import { Tools } from './tools';

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

@Injectable()
export class IaService {
  constructor(
    private srcExamDatesService: SourceExamDateService,
    private srcScheduleService: SourceScheduleService,
    private srcOfficeHours: SourceOfficeHours,
    private system: SystemPromptService,
    private srcTelephoneService: SourceTelephoneService,
    @Inject(forwardRef(() => WaService)) private waService: WaService,
  ) {}

  private logResponseDetails(stage: string, response: any) {
    console.log(`\n🔍 ${stage}`);
    const usage = response?.steps?.[0]?.usage;

    if (usage && typeof usage.promptTokens === 'number') {
      console.log('\n📊 Token Usage:');
      console.log('┌─────────────────┬──────────┬─────────┐');
      console.log('│ Type           │ Tokens   │    %    │');
      console.log('├─────────────────┼──────────┼─────────┤');
      console.log(
        `│ Input          │ ${String(usage.promptTokens).padEnd(8)} │  ${((usage.promptTokens / usage.totalTokens) * 100).toFixed(1).padEnd(6)}% │`,
      );
      console.log(
        `│ Output         │ ${String(usage.completionTokens).padEnd(8)} │  ${((usage.completionTokens / usage.totalTokens) * 100).toFixed(1).padEnd(6)}% │`,
      );
      console.log('├─────────────────┼──────────┼─────────┤');
      console.log(
        `│ Total          │ ${String(usage.totalTokens).padEnd(8)} │   100%  │`,
      );
      console.log('└─────────────────┴──────────┴─────────┘');

      const inputCost = (usage.promptTokens * 0.03) / 1000; // $0.03 per 1K tokens
      const outputCost = (usage.completionTokens * 0.06) / 1000; // $0.06 per 1K tokens
      const totalCost = inputCost + outputCost;

      console.log('\n💰 Cost Estimation (GPT-4):');
      console.log('┌─────────────────┬──────────┐');
      console.log('│ Type           │   Cost   │');
      console.log('├─────────────────┼──────────┤');
      console.log(`│ Input          │  $${inputCost.toFixed(4).padEnd(6)} │`);
      console.log(`│ Output         │  $${outputCost.toFixed(4).padEnd(6)} │`);
      console.log('├─────────────────┼──────────┤');
      console.log(`│ Total          │  $${totalCost.toFixed(4).padEnd(6)} │`);
      console.log('└─────────────────┴──────────┘');
    } else {
      const alternativeUsage = response?.usage || response?.raw?.usage;
      if (alternativeUsage) {
        const { prompt_tokens, completion_tokens, total_tokens } =
          alternativeUsage;
        console.log('\n📊 Token Usage (Alternative Source):');
        console.log('┌─────────────────┬──────────┬─────────┐');
        console.log('│ Type           │ Tokens   │    %    │');
        console.log('├─────────────────┼──────────┼─────────┤');
        console.log(
          `│ Input          │ ${String(prompt_tokens).padEnd(8)} │  ${((prompt_tokens / total_tokens) * 100).toFixed(1).padEnd(6)}% │`,
        );
        console.log(
          `│ Output         │ ${String(completion_tokens).padEnd(8)} │  ${((completion_tokens / total_tokens) * 100).toFixed(1).padEnd(6)}% │`,
        );
        console.log('├─────────────────┼──────────┼─────────┤');
        console.log(
          `│ Total          │ ${String(total_tokens).padEnd(8)} │   100%  │`,
        );
        console.log('└─────────────────┴──────────┴─────────┘');

        const inputCost = (prompt_tokens * 0.03) / 1000;
        const outputCost = (completion_tokens * 0.06) / 1000;
        const totalCost = inputCost + outputCost;

        console.log('\n💰 Cost Estimation (o3-mini):');
        console.log('┌─────────────────┬──────────┐');
        console.log('│ Type           │   Cost   │');
        console.log('├─────────────────┼──────────┤');
        console.log(`│ Input          │  $${inputCost.toFixed(4).padEnd(6)} │`);
        console.log(
          `│ Output         │  $${outputCost.toFixed(4).padEnd(6)} │`,
        );
        console.log('├─────────────────┼──────────┤');
        console.log(`│ Total          │  $${totalCost.toFixed(4).padEnd(6)} │`);
        console.log('└─────────────────┴──────────┘');
      } else {
        console.log('\n⚠️  No token usage data available');
      }
    }

    if (response?.messages?.length) {
      console.log(`\n📝 Messages: ${response.messages.length}`);
    } else if (response?.response?.messages?.length) {
      console.log(`\n📝 Messages: ${response.response.messages.length}`);
    }
  }

  async processChatStream(prompt: string) {
    try {
      console.log('Processing prompt:', prompt);
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

      const tools = new Tools(
        this.srcExamDatesService,
        this.srcScheduleService,
        this.srcOfficeHours,
        this.srcTelephoneService,
      );

      console.log('\n🚀 Starting Initial Generation...');
      const result = await generateText({
        model: openai('o3-mini'),
        messages,
        tools: {
          getExamDates: tools.getExamDatesTool,
          getCourseSessions: tools.getCourseSessionsTool,
          getCourseSessionsByComission: tools.getCourseSessionsByComissionTool,
          getOfficeByDepartment: tools.getOfficeByDepartmentTool,
          getCourseSessionsByCourseCode:
            tools.getCourseSessionsByCourseCodeTool,
          getCourseSessionsByTerm: tools.getCourseSessionsByTermTool,
          getTelephonesByNames: tools.getTelephonesByNames,
        },
        toolChoice: 'auto',
        temperature: 0,
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'initial-generation',
          recordInputs: true,
          recordOutputs: true,
          metadata: {
            stage: 'initial',
          },
        },
        headers: {
          'OpenAI-Beta': 'assistants=v1',
        },
      });

      const initialResponse = result;
      this.logResponseDetails('Initial Generation', initialResponse);

      if (initialResponse?.response?.messages) {
        messages.push(...initialResponse.response.messages);
      }

      console.log('\n🔄 Starting Final Generation...');
      const finalResult = await generateText({
        model: openai('o3-mini'),
        messages,
        temperature: 0,
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'final-generation',
          recordInputs: true,
          recordOutputs: true,
          metadata: {
            stage: 'final',
          },
        },
        headers: {
          'OpenAI-Beta': 'assistants=v1',
        },
      });

      const finalResponse = finalResult;
      this.logResponseDetails('Final Generation', finalResponse);

      if (finalResponse?.response?.messages) {
        messages.push(...finalResponse.response.messages);
      }

      console.log('\n✅ Chat processing completed successfully');
      return finalResult.text;
    } catch (error: any) {
      console.error('❌ Failed to process IA message:', error);
      throw new Error(`Failed to process IA message: ${error.message}`);
    }
  }
}
