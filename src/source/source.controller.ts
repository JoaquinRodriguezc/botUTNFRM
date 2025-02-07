import { Controller, Get, Param } from '@nestjs/common';
import { SourceScheduleService } from './courseSessions/source.schedule.service';
import { SourceExamDateService } from './examDates/source.examDates.service';
import { SourceOfficeHours } from './officeHours/source.officeHours.service';

@Controller('source')
export class SourceController {
  constructor(
    private sourceExamDatesService: SourceExamDateService,
    private sourceScheduleService: SourceScheduleService,
    private sourceOfficeHoursService: SourceOfficeHours,
  ) {}
  @Get('/horarios')
  async getCourseSessions() {
    return this.sourceScheduleService.getCourseSessions();
  }
  @Get('/horarios/:subject/:commission')
  async getCourseSessionsBySubAndComission(
    @Param('subject') subject: string,
    @Param('commission') commission: string,
  ) {
    console.log(subject, commission);
    return this.sourceScheduleService.getCourseSessionsBySubjectComission(
      subject,
      commission,
    );
  }
  @Get('mesas')
  async getFinalExamDates() {
    return this.sourceExamDatesService.getExamDates();
  }
  @Get('/consulta')
  async getOfficeHours() {
    return this.sourceOfficeHoursService.getOfficeHours();
  }
}
