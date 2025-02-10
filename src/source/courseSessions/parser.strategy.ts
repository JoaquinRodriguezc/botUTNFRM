import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'node:fs/promises';
import { isEqual, normalize } from 'src/utils/utils';
import { StringDecoder } from 'string_decoder';
import {
  CourseSession,
  Degrees,
  ScheduleEntry,
  Subject,
} from '../source.types';
@Injectable()
export class ParserStrategy {
  constructor(private configService: ConfigService) {
    this.fetchAndSaveCourseSessions();
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async fetchAndSaveCourseSessions(): Promise<void> {
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
    try {
      console.log('Writing courseSessions');
      await fs.writeFile(
        './src/source/courseSessions/courseSessions.json',
        JSON.stringify(courseSessions),
      );
    } catch (e) {
      console.log('Error saving courseSessions', e);
    }
  }
  async getCourseSessions(): Promise<CourseSession[]> {
    try {
      const file = await fs.readFile(
        './src/source/courseSessions/courseSessions.json',
      );
      const sessions = JSON.parse(file.toString());
      return sessions;
    } catch (e) {
      console.log('Error while loading course sessions', e);
      await this.fetchAndSaveCourseSessions();
      return [];
    }
  }
  async getCourseSessionsBySubject(
    subjectName: string,
  ): Promise<CourseSession[]> {
    const courseSessions = await this.getCourseSessions();
    return courseSessions.filter(
      (c) => normalize(c.subject.name) === normalize(subjectName),
    );
  }
  async getCourseSessionsBySubjectComission(
    subjectName: string,
    commission: string,
  ) {
    const courseSessions = await this.getCourseSessions();
    return courseSessions.filter(
      (c) =>
        normalize(c.subject.name) === normalize(subjectName) &&
        normalize(c.subject.courseCode) === normalize(commission),
    );
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
  private cleanRow(row: string) {
    return row.replaceAll(
      /<center>|<\/center>|<td>|<tr class='color\d+'>/g,
      '',
    );
  }

  private parseHTMLRow(row: string): ParsedRowType {
    const info = this.cleanRow(row)
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
