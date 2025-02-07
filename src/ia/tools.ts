import { tool } from 'ai';
import { z } from 'zod';
import { SourceExamDateService } from 'src/source/examDates/source.examDates.service';
import { SourceScheduleService } from 'src/source/courseSessions/source.schedule.service';
import { Injectable } from '@nestjs/common';
import { SourceOfficeHours } from 'src/source/officeHours/source.officeHours.service';

@Injectable()
export class Tools {
  constructor(
    private srcExamDatesService: SourceExamDateService,
    private srcScheduleService: SourceScheduleService,
    private srcOfficeHours: SourceOfficeHours,
  ) {}

  getExamDatesTool = tool({
    description: 'Get dates for final exam for a given subject',
    parameters: z.object({
      subjectName: z
        .string()
        .describe('Subject name so we find dates for exam'),
    }),
    execute: async ({ subjectName }) => ({
      subjectName,
      dates: await this.srcExamDatesService.getExamDatesBySubject(subjectName),
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
        await this.srcScheduleService.getCourseSessionsBySubject(subjectName),
    }),
  });

  getCourseSessionsByComissionTool = tool({
    description: 'Get course sessions for a specific subject and commission',
    parameters: z.object({
      subjectName: z.string().describe('Subject name to find course sessions'),
      commission: z.string().describe('Commission number or identifier'),
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

  getOfficeByDepartmentTool = tool({
    description: 'Get office hours information for a specific department',
    parameters: z.object({
      department: z.string().describe('Department name to find office hours'),
    }),
    execute: async ({ department }) => ({
      department,
      officeHours: await this.srcOfficeHours.getOfficeByDepartment(department),
    }),
  });
}
