import { Injectable } from '@nestjs/common';
import { ParserStrategy } from './parser.strategy';

@Injectable()
export class SourceScheduleService {
  constructor(private parserStrategy: ParserStrategy) {}
  async getCourseSessions() {
    return this.parserStrategy.getCourseSessions();
  }
  async getCourseSessionsBySubject(subjectName: string) {
    const sessions =
      await this.parserStrategy.getCourseSessionsBySubject(subjectName);
    return sessions;
  }
  async getCourseSessionsBySubjectComission(
    subjectName: string,
    commission: string,
  ) {
    const sessionsbyCommission =
      await this.parserStrategy.getCourseSessionsBySubjectComission(
        subjectName,
        commission,
      );
    return sessionsbyCommission;
  }
  async getCourseSessionsByCourseCode(courseCode: string) {
    const courseSession = await this.parserStrategy.getCourseSessions();
    return courseSession.filter((c) => c.subject.courseCode === courseCode);
  }
  async getCourseSessionsByTerm(term: string, commission: string) {
    const courseTerm = await this.parserStrategy.getCourseSessionsByTerm(
      term,
      commission,
    );

    return courseTerm;
  }
}
