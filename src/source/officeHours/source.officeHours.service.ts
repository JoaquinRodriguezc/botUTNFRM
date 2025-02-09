import { Injectable } from '@nestjs/common';
import { LinksStrategy } from './links.strategy';

@Injectable()
export class SourceOfficeHours {
  constructor(private linksStrategy: LinksStrategy) {}
  async getOfficeHours() {
    return this.linksStrategy.getOfficeHours();
  }
  async getOfficeByDepartment(deparment: string) {
    const officehours = this.linksStrategy.getOfficeHoursByDeparment(deparment);
    return officehours;
  }
  async getOfficeHoursBySubject() {}
}
