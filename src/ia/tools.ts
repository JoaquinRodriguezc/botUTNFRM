import { Injectable } from '@nestjs/common';
import { tool } from 'ai';
import { SourceScheduleService } from 'src/source/courseSessions/source.schedule.service';
import { SourceExamDateService } from 'src/source/examDates/source.examDates.service';
import { SourceOfficeHours } from 'src/source/officeHours/source.officeHours.service';
import { z } from 'zod';

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

  getCourseSessionsByCourseCodeTool = tool({
    description: 'Get course sessions by specific course code',
    parameters: z.object({
      courseCode: z
        .string()
        .describe('Course code to find corresponding sessions'),
    }),
    execute: async ({ courseCode }) => ({
      courseCode,
      dates:
        await this.srcScheduleService.getCourseSessionsByCourseCode(courseCode),
    }),
  });
}
