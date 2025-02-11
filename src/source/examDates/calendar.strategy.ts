import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { calendar_v3 } from 'googleapis';
import * as fs from 'node:fs/promises';
import { FinalExam } from '../source.types';
import { GoogleCalendarService } from './calendar.client';
import * as departments from './departments.json';
@Injectable()
export class CalendarStrategy {
  constructor(private calendarService: GoogleCalendarService) {
    this.fetchAndSaveDate();
  }

  public async getSubjectExamDates(subject: string) {
    const dates = await this.getExamDates();
    const subjectDate = dates.find(
      (s) => s.subjectName.toLowerCase() === subject.toLowerCase(),
    );
    if (!subjectDate) {
      return [];
    }
    return subjectDate;
  }
  @Cron(CronExpression.EVERY_30_MINUTES)
  public async fetchAndSaveDate(): Promise<void> {
    const events = await this.calendarService.getEvents();
    const mapa = this.parseEventString(events);
    try {
      await fs.writeFile(
        'src/source/examDates/finalExamdDates.json',
        JSON.stringify(mapa),
      );
      console.log('Exam dates saved');
    } catch (error) {
      console.log('Error saving final exam dates', error);
    }
  }
  public async getExamDates() {
    try {
      const file = await fs.readFile(
        'src/source/examDates/finalExamdDates.json',
      );
      const dates = JSON.parse(file.toString());
      return dates;
    } catch (error) {
      console.log('Error while loading exam dates', error);
      await this.fetchAndSaveDate();
      return [];
    }
  }

  private parseEventString(events: calendar_v3.Schema$Event[]): FinalExam[] {
    let finalExamDates: FinalExam[] = [];
    events.forEach((event) => {
      const lines: string[] = this.getLines(event.description);
      lines.forEach((subjectName) => {
        const date = {
          day: event.start.date ?? null,
          startTime: event.start.dateTime ?? null,
          endTime: null,
        };
        const existingSubject = finalExamDates.findIndex(
          (s) => s.subjectName === subjectName,
        );
        if (existingSubject < 0) {
          return finalExamDates.push({
            subjectName: subjectName,
            examDays: [date],
          });
        }
        finalExamDates[existingSubject].examDays.push(date);
      });
    });
    return finalExamDates;
  }
  private getLines(description: string): string[] {
    if (!description) return [];
    const d = description
      .replaceAll(/:|<\/p>|<b>.*?<\/b>|<p>|<b> <\/b>|<p dir="ltr">|<br>/g, ';')
      .replaceAll(/\s*\(.*?\)\s*/g, '')
      .replaceAll(/Mesas correspondientes al día/g, '')
      .split(';')
      .filter((line) => {
        let flag = false;
        departments.forEach((deparment) => {
          if (line.includes(deparment)) {
            flag = true;
          }
        });
        if (!flag) return line;
      })
      .map((line) => line.trim())
      .filter((line) => line !== '');
    return d;
  }
}
