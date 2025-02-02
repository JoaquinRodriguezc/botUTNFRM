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
    /*
    Server responds with the encoding ISO-8859-1 (Latin-1), so we need to decode it;
    otherwise, UTF-8 is used by default, and accented characters appear incorrectly.
    */
    const decoder = new StringDecoder('latin1');

    const arrayBuffer = await response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    const textDecoded = decoder.write(buffer);

    return textDecoded;
  }

  private parseRawTable(t: string) {
    const table = t
      .replace('</table>', 'ASD')
      .replace('<table align="center" width="700" id="horario" >', 'ASD')
      .split('ASD')[1];

    // Remove what we don't need

    const cleanedTable = table
      .replace(/<\/*center>/, '')
      .replace(/class\s*=\s*'[^']*'/i, '')
      .replace(/\s{2,}/g, '');

    const rows = cleanedTable
      .split(/<\s*\/*tr\s*>/)
      .map((e) => e.trimStart())
      .filter((e) => e !== '');

    rows.shift();

    const parsedRows = rows.map((r) => this.parseHTMLRow(r));

    const courseSessions: CourseSession[] = [];
    let currentRow = null;
    parsedRows.forEach((row) => {
      const { date, subject, curriculum } = row;
      if (subject.year) {
        currentRow = row;
        return courseSessions.push({
          subject,
          schedule: [date],
          curriculum,
          professor: null,
          classroom: null,
        });
      }
      const exist = courseSessions.findIndex((c) => {
        return isEqual(
          {
            subject: c.subject,
            curriculum: c.curriculum,
          },
          { subject: currentRow.subject, curriculum },
        );
      });
      if (exist >= 0) {
        return courseSessions[exist].schedule.push(date);
      }
      currentRow.curriculum = curriculum;
      return courseSessions.push({
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
    const info = row
      .replaceAll('<td>', '')
      .split('</td>')
      .map((e) => e.trim());
    return {
      subject: {
        year: info[0],
        term: info[1],
        name: info[2],
        courseCode: info[3],
        deparment: null,
      },
      curriculum: info[4],
      date: {
        day: info[5],
        startTime: info[6],
        endTime: info[7],
      },
    };
  }
}
type ParsedRowType = {
  subject: Subject;
  curriculum: string;
  date: ScheduleEntry;
};
