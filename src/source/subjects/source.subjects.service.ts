import * as abbreviations from './abbreviations.json';
import * as subjects from './subjects.json';
export class SourceSubjectsService {
  constructor() {}

  async getSubjects() {
    return subjects;
  }
  async getabreviations() {
    return abbreviations;
  }
}
