import { Injectable } from '@nestjs/common';
import { ParserStrategy } from './parser.strategy';

@Injectable()
export class SourceScheduleService {
  constructor(private parserStrategy: ParserStrategy) {}
  async getCourseSessions() {
    return this.parserStrategy.getCourseSessions();
  }
  async getCourseSessionsBySubject(subjectName: string) {
    return this.parserStrategy.getCourseSessionsBySubject(subjectName);
  }
}
