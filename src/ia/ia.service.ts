import { Injectable } from '@nestjs/common';
import { CoreMessage, generateText, streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { SourceSubjectsService } from 'src/source/subjects/source.subjects.service';
import { schema } from './schema';
import { z } from 'zod';
import { SourceExamDateService } from 'src/source/examDates/source.examDates.service';
@Injectable()
export class IaService {
  constructor(
    private sourceSubService: SourceSubjectsService,
    private srcExamDatesService: SourceExamDateService,
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
          getExamDates: tool({
            description: 'Get dates for final exam for a given subject',
            parameters: z.object({
              subjectName: z
                .string()
                .describe('Subject name so we find dates for exam'),
            }),
            execute: async ({ subjectName }) => ({
              subjectName,
              dates:
                await this.srcExamDatesService.getExamDatesBySubject(
                  subjectName,
                ),
            }),
          }),
        },
      });
      const toolRes = result.response.messages.find((m) => m.role === 'tool');
      messages.push({
        role: toolRes.role,
        content: [
          {
            toolCallId: toolRes.content[0].toolCallId,
            type: 'tool-result',
            toolName: toolRes.content[0].toolName,
            result: toolRes.content[0].result,
          },
        ],
      });
      const res = await generateText({
        model: openai('gpt-4o'),
        messages,
      });
      return res.text;
    } catch (error) {
      console.error('Failed to process IA message', error);
      throw new Error(`Failed to process IA message: ${error.message}`);
    }
  }
}
