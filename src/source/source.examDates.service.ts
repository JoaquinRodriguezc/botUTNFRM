import { Injectable } from '@nestjs/common';
import { Subject } from './source.types';

@Injectable()
export class SourceExamDateService {
  constructor() {}

  async getSubjects() {}
  async getFinalExams() {}
  async getFinalExamBySubject(subject: Subject) {}
  async getOfficeHours(subject: Subject) {}
}
