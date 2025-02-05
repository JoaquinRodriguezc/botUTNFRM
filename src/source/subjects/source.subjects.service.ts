import * as subjects from './subjects.json';
export class SourceSubjectsService {
  constructor() {}

  async getSubjects() {
    return subjects;
  }
}
