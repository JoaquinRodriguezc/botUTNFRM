import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './examDates/calendar.client';
import { SourceExamDateService } from './examDates/source.examDates.service';
import { CalendarStrategy } from './examDates/calendar.strategy';
import { SourceScheduleService } from './courseSessions/source.schedule.service';
import { ParserStrategy } from './courseSessions/parser.strategy';
import { SourceSubjectsService } from './subjects/source.subjects.service';
import { SourceController } from './source.controller';
import { SourceOfficeHours } from './officeHours/source.officeHours.service';
import { LinksStrategy } from './officeHours/links.strategy';
import { SourceTelephoneService } from './telephones/source.telephones.service';
@Module({
  providers: [
    GoogleCalendarService,
    SourceExamDateService,
    SourceScheduleService,
    SourceTelephoneService,
    ParserStrategy,
    CalendarStrategy,
    SourceSubjectsService,
    SourceOfficeHours,
    LinksStrategy,
  ],
  controllers: [SourceController],
  exports: [
    SourceExamDateService,
    SourceScheduleService,
    SourceSubjectsService,
    SourceOfficeHours,
    SourceTelephoneService,
  ],
})
export class SourceModule {}
