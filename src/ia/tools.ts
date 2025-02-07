import { tool } from 'ai';
import { z } from 'zod';
import { SourceExamDateService } from 'src/source/examDates/source.examDates.service';
import { SourceScheduleService } from 'src/source/courseSessions/source.schedule.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Tools {
    constructor(private srcExamDatesService: SourceExamDateService, private srcScheduleService: SourceScheduleService) { };

    getExamDatesTool = tool({
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
    });

    getCourseSessionsTool = tool({
        description: 'Get course session',
        parameters: z.object({
            subjectName: z
                .string()
                .describe('Subject name so we find course session '),
        }),
        execute: async ({ subjectName }) => ({
            subjectName,
            dates:
                await this.srcScheduleService.getCourseSessionsBySubject(
                    subjectName,
                ),
        }),
    });

    getCourseSessionsByComissionTool = tool({
        description: 'Get course sessions for a specific subject and commission',
        parameters: z.object({
            subjectName: z
                .string()
                .describe('Subject name to find course sessions'),
            commission: z
                .string()
                .describe('Commission number or identifier'),
        }),
        execute: async ({ subjectName, commission }) => ({
            subjectName,
            commission,
            dates: await this.srcScheduleService.getCourseSessionsBySubjectComission(
                subjectName,
                commission,
            ),
        }),
    });
}