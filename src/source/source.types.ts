export type Subject = {
  year: string;
  term: string;
  name: string;
  courseCode: string;
  deparment: Department;
};

export type ScheduleEntry = {
  day: string;
  startTime: string;
  endTime: string;
};

export type ClassroomLocation = {
  building: string;
  floor: string;
  classroom: number;
};
export type FinalExam = {
  subjectName: string;
  examDays: ScheduleEntry[];
  classroom?: ClassroomLocation;
};

export type CourseSession = {
  subject: Subject;
  professor: string;
  classroom: ClassroomLocation;
  schedule: ScheduleEntry[];
  curriculum?: string;
};
export type OfficeHours = {
  subject: Subject;
  schedule: ScheduleEntry[];
};
export type Curriculum = {
  name: string;
  subjects: Subject[];
};
export type Degree = {
  name: string;
  length: number;
  curriculum: Curriculum[];
};
export type Department = {
  name: string;
};
export type Campus = {
  name: string;
  address: string;
};
export enum Degrees {
  SISTEMAS = '5',
  ELECTRONICA = '9',
  CIVIL = '31',
  ELECTROMECANICA = '8',
  TELECOMUNICACIONES = '15',
  QUIMICA = '27',
}
