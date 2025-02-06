import { Injectable } from '@nestjs/common';
import { StringDecoder } from 'string_decoder';
import {
  CourseSession,
  Degrees,
  ScheduleEntry,
  Subject,
} from '../source.types';
import { isEqual } from 'src/utils/utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ParserStrategy {
  constructor(private configService: ConfigService) {}

  private cleanHtmlTags(text: string): string {
    if (!text) return '';
    return text
      .replace(/<\/?center>/g, '')
      .replace(/<tr[^>]*>/g, '')
      .replace(/<\/tr>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isValidRow(row: string): boolean {
    const cleanedRow = this.cleanHtmlTags(row);
    return cleanedRow.length > 0 && !cleanedRow.match(/^[\s,]*$/);
  }

  async getCourseSessions(): Promise<CourseSession[]> {
    const rawInfo = await Promise.all([
      ...Object.values(Degrees).map((d) => {
        return this.getRawCourseSessions(d);
      }),
    ]);
    const courseSessions = rawInfo
      .map((h) => {
        return this.parseRawTable(h);
      })
      .flat();
    return courseSessions;
  }

  async getCourseSessionsBySubject(
    subjectName: string,
  ): Promise<CourseSession[]> {
    const courseSessions = await this.getCourseSessions();
    return courseSessions.filter((c) => c.subject.name === subjectName);
  }

  private async getRawCourseSessions(area: string) {
    const formData = new URLSearchParams();
    formData.append('especialidad', area);

    const response = await fetch(
      this.configService.getOrThrow('COURSE_SESSION_URL'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      },
    );

    const decoder = new StringDecoder('latin1');
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const textDecoded = decoder.write(buffer);
    return textDecoded;
  }

  async getCourseSessionsBySubjectComission(
    subjectName: string,
    commission: string,
  ): Promise<CourseSession[]> {
    const courseSessions = await this.getCourseSessions();
    return courseSessions.filter(
      (c) =>
        c.subject.name === subjectName &&
        this.cleanHtmlTags(c.subject.courseCode) === commission,
    );
  }

  private parseRawTable(t: string) {
    // Extract table content between opening and closing tags
    const tableMatch = t.match(/<table[^>]*>([\s\S]*?)<\/table>/);
    if (!tableMatch) return [];

    const tableContent = tableMatch[1];

    // Split into rows and clean them
    const rows = tableContent
      .split(/<\/?tr[^>]*>/)
      .map((row) => row.trim())
      .filter((row) => this.isValidRow(row));

    // Remove header row
    rows.shift();

    const parsedRows = rows
      .map((r) => this.parseHTMLRow(r))
      .filter((row) => row.subject.name); // Filter out empty rows

    const courseSessions: CourseSession[] = [];
    let currentRow = null;

    parsedRows.forEach((row) => {
      const { date, subject, curriculum } = row;
      if (subject.year) {
        currentRow = row;
        courseSessions.push({
          subject,
          schedule: [date],
          curriculum,
          professor: null,
          classroom: null,
        });
        return;
      }

      if (!currentRow) return;

      const existingIndex = courseSessions.findIndex((c) =>
        isEqual(
          {
            subject: c.subject,
            curriculum: c.curriculum,
          },
          { subject: currentRow.subject, curriculum },
        ),
      );

      if (existingIndex >= 0) {
        courseSessions[existingIndex].schedule.push(date);
        return;
      }

      currentRow.curriculum = curriculum;
      courseSessions.push({
        subject: currentRow.subject,
        schedule: [date],
        curriculum,
        professor: null,
        classroom: null,
      });
    });

    return courseSessions;
  }

  private parseHTMLRow(row: string): ParsedRowType {
    const cleanedRow = this.cleanHtmlTags(row);
    const cells = cleanedRow
      .split(/<\/?td[^>]*>/)
      .map((cell) => this.cleanHtmlTags(cell))
      .filter((cell) => cell.length > 0);

    if (cells.length < 8) {
      return {
        subject: {
          year: '',
          term: '',
          name: '',
          courseCode: '',
          deparment: null,
        },
        curriculum: '',
        date: {
          day: '',
          startTime: '',
          endTime: '',
        },
      };
    }

    return {
      subject: {
        year: cells[0],
        term: cells[1],
        name: cells[2],
        courseCode: cells[3],
        deparment: null,
      },
      curriculum: cells[4],
      date: {
        day: cells[5],
        startTime: cells[6],
        endTime: cells[7],
      },
    };
  }
}

type ParsedRowType = {
  subject: Subject;
  curriculum: string;
  date: ScheduleEntry;
};
