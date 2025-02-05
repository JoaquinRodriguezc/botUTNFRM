import { Injectable } from '@nestjs/common';
import { ParserStrategy } from './parser.strategy';

@Injectable()
export class SourceScheduleService {
  constructor(private parserStrategy: ParserStrategy) { }
  async getCourseSessions() {
    return this.parserStrategy.getCourseSessions();
  }
  async getCourseSessionsBySubject(subjectName: string) {
    const sessions = await this.parserStrategy.getCourseSessionsBySubject(subjectName);
    const session = {
      subject: {
        name: "Sistemas Operativos",
        year: "3",
        term: "1",
        courseCode: "SO",
        deparment: {
          name: "Sistemas de Información"
        }
      },
      professor: "",
      classroom: {
        building: "Sistemas",
        floor: "Planta Baja",
        classroom: 5
      },
      schdule: [{ day: "2025-02 - 12", startTime: null, endTime: null }],
      curriculum: "Ingenieria en Sistemas"
    };
    console.log(session)
    return session
  }
}
