import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './examDates/calendar.client';
import { SourceExamDateService } from './examDates/source.examDates.service';
import { CalendarStrategy } from './examDates/calendar.strategy';
import { SourceScheduleService } from './courseSessions/source.schedule.service';
import { ParserStrategy } from './courseSessions/parser.strategy';
import { SourceSubjectsService } from './subjects/source.subjects.service';
import { SourceController } from './source.controller';

@Module({
  providers: [
    GoogleCalendarService,
    SourceExamDateService,
    SourceScheduleService,
    ParserStrategy,
    CalendarStrategy,
    SourceSubjectsService,
  ],
  controllers: [SourceController],
  exports: [
    SourceExamDateService,
    SourceScheduleService,
    SourceSubjectsService,
  ],
})
export class SourceModule {}
