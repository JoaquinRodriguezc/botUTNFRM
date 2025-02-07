import { Injectable, NotImplementedException } from '@nestjs/common';
import * as officeHours from './officeHoursLink.json';
import { normalize } from 'src/utils/utils';
@Injectable()
export class LinksStrategy {
  constructor() {}

  async getOfficeHours() {
    return officeHours;
  }
  async getOfficeHoursByDeparment(deparment: string) {
    const normalizedDepartment = normalize(deparment);
    return officeHours[normalizedDepartment];
  }
}
