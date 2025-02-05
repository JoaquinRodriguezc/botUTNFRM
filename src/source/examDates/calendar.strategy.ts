import { calendar_v3 } from 'googleapis';
import { GoogleCalendarService } from './calendar.client';
import { Injectable } from '@nestjs/common';
import { FinalExam } from '../source.types';

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
    console.log(events);
    const mapa = this.parseEventString(events);
    return mapa;
  }

  private parseEventString(events: calendar_v3.Schema$Event[]): FinalExam[] {
    let finalExamDates: FinalExam[] = [];
    events.forEach((event) => {
      const lines: string[] = this.getLines(event.description);
      console.log(lines);
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
    return description
      .replace(/<p>|<b> <\/b>|<p dir="ltr">|<br>/g, ';')
      .replace(/\s*\(.*?\)\s*/g, '')
      .split(';')
      .map((e) => e.trim().slice(0, -4));
  }
}
