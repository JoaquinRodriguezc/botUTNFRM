import { calendar_v3 } from 'googleapis';
import { GoogleCalendarService } from './calendar.client';
import { Injectable } from '@nestjs/common';
import { FinalExam } from '../source.types';

@Injectable()
export class CalendarStrategy {
  constructor(private calendarService: GoogleCalendarService) {}

  public async getSubjectExamDates(subject: string) {
    const dates = await this.getExamDates();
    const subjectDate = dates.find((s) => s.subjectName === subject);
    return subjectDate;
  }
  public async getExamDates() {
    const events = await this.calendarService.getEvents();
    const mapa = this.parseEventString(events);
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
    const subjects = ['Control de Procesos'];
    if (!description) return [];
    return description
      .replace(/<p>|<b> <\/b>|<p dir="ltr">|<br>/g, ';')
      .replace(/\s*\(.*?\)\s*/g, '')
      .split(';')
      .map((e) => e.trim().slice(0, -4))
      .filter((e) => subjects.includes(e));
  }
}
