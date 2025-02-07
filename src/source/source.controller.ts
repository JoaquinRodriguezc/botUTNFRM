import { Controller, Get } from '@nestjs/common';
import { SourceScheduleService } from './courseSessions/source.schedule.service';
import { SourceExamDateService } from './examDates/source.examDates.service';

@Controller('source')
export class SourceController {
  constructor(
    private sourceExamDatesService: SourceExamDateService,
    private sourceScheduleService: SourceScheduleService,
  ) {}
  @Get('/horarios')
  async getCourseSessions() {
    return this.sourceScheduleService.getCourseSessions();
  }
  @Get('mesas')
  async getFinalExamDates() {
    return this.sourceExamDatesService.getExamDates();
  }
}
