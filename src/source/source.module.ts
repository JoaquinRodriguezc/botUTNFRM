import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './examDates/calendar.client';
import { SourceExamDateService } from './examDates/source.examDates.service';
import { CalendarStrategy } from './examDates/calendar.strategy';
import { SourceScheduleService } from './courseSessions/source.schedule.service';
import { ParserStrategy } from './courseSessions/parser.strategy';

@Module({
  providers: [
    GoogleCalendarService,
    SourceExamDateService,
    SourceScheduleService,
    ParserStrategy,
    CalendarStrategy,
  ],
  controllers: [],
  exports: [SourceExamDateService, SourceScheduleService],
})
export class SourceModule {}
