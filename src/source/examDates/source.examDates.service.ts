import { Injectable } from '@nestjs/common';
import { CalendarStrategy } from './calendar.strategy';

@Injectable()
export class SourceExamDateService {
  constructor(private calendarStrategy: CalendarStrategy) {}
  async getExamDates() {
    return this.calendarStrategy.getExamDates();
  }
  async getExamDatesBySubject(subjectName: string) {
    const res = await this.calendarStrategy.getSubjectExamDates(subjectName);
    return res;
  }
}
