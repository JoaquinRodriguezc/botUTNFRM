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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class IaService {
  constructor(
    private srcExamDatesService: SourceExamDateService,
    private srcScheduleService: SourceScheduleService,
    private srcOfficeHours: SourceOfficeHours,
    private system: SystemPromptService,
    private srcTelephoneService: SourceTelephoneService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(forwardRef(() => WaService)) private waService: WaService,
  ) {}

  async processChatStream(prompt: string, userId: string) {
    try {
      const context = await this.getConversationContext(userId);
      const systemprompt = await this.system.getSystemPrompt();

      const currentConversation: CoreMessage[] = [
        {
          role: 'system',
          content: systemprompt,
        },
        ...context,
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
      const initialResponse = await generateText({
        model: openai('gpt-4o'),
        messages: currentConversation,
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

      if (initialResponse?.response?.messages) {
        this.updateContext(userId, initialResponse.response.messages);
      }

      this.logResponseDetails('Initial Generation', initialResponse);

      console.log('\n🔄 Starting Final Generation...');
      const finalResponse = await generateText({
        model: openai('gpt-4o'),
        messages: [
          ...currentConversation,
          ...(initialResponse?.response?.messages || []),
        ],
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

      this.logResponseDetails('Final Generation', finalResponse);

      if (finalResponse?.response?.messages) {
        this.updateContext(userId, [
          {
            role: 'assistant',
            content: finalResponse.text,
          },
        ]);
      }

      console.log('\n✅ Chat processing completed successfully');
      return finalResponse.text;
    } catch (error: any) {
      throw new Error(`Failed to process IA message: ${error.message}`);
    }
  }
  private async getConversationContext(userId: string) {
    const context = await this.cacheManager.get<string>(userId);
    if (context) return JSON.parse(context);
    return [];
  }

  private async updateContext(userId: string, newMessages: CoreMessage[]) {
    const context = await this.getConversationContext(userId);
    context.push(...newMessages);
    const newContext = context.slice(-10);
    await this.cacheManager.set(userId, JSON.stringify(newContext));
  }

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

        console.log('\n�� Cost Estimation (o3-mini):');
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
}
