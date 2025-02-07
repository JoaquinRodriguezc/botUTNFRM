import { calendar_v3 } from 'googleapis';
import { GoogleCalendarService } from './calendar.client';
import { Injectable } from '@nestjs/common';
import { FinalExam } from '../source.types';
import * as departments from './departments.json';
@Injectable()
export class CalendarStrategy {
  constructor(private calendarService: GoogleCalendarService) {}

  public async getSubjectExamDates(subject: string) {
    const dates = await this.getExamDates();
    const subjectDate = dates.find(
      (s) => s.subjectName.toLowerCase() === subject.toLowerCase(),
    );
    return subjectDate;
  }
  public async getExamDates() {
    const events = await this.calendarService.getEvents();
    const mapa = this.parseEventString(events);
    console.log(mapa);
    return mapa;
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
    console.log(description);
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
    console.log(d);
    return d;
  }
}
