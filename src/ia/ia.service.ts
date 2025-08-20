import { openai } from '@ai-sdk/openai';
import { Inject, Injectable } from '@nestjs/common';
import { CoreMessage, generateText } from 'ai';
import { SystemPromptService } from './systemprompt';
import { Tools } from './tools';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { collectTools } from './schema';
@Injectable()
export class IaService {
  constructor(
    private system: SystemPromptService,
    private tools: Tools,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async processChatStream(prompt: string, userId: string) {
    try {
      let time = 'Time taken by processChatStream';
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
      const sdkTools = collectTools(this.tools);

      console.log('\n🚀 Starting Initial Generation...');

      const response = await generateText({
        model: openai('gpt-5'),
        messages: currentConversation,
        tools: sdkTools,
        maxSteps: 10,
        temperature: 1,
      });

      if (response?.response?.messages) {
        this.updateContext(userId, response.response.messages);
      }

      console.log('Chat processing completed successfully');
      return response.text;
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
    await this.cacheManager.set(userId, JSON.stringify(context));
  }
}
