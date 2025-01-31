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
  classroom: ClassroomLocation;
};

export type CourseSession = {
  subject: Subject;
  professor: string;
  classroom: ClassroomLocation;
  schedule: ScheduleEntry[];
  curriculum?: Curriculum;
};
export type OfficeHours = {
  subject: Subject;
  schedule: ScheduleEntry[];
};
export type Curriculum = {
  name: string;
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
