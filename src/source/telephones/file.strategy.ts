import { Injectable } from '@nestjs/common';
import * as phoneNumbers from './telephones.json';
@Injectable()
export class FileStrategy {
  constructor() {}

  getTelephones() {
    if (!phoneNumbers) {
      return null;
    }
    return phoneNumbers;
  }

  findByName(name: string): any {
    const phoneNumbers = this.getTelephones();
    if (!phoneNumbers) {
      console.error("Can't read phone numbers");
      return null;
    }
    const values = Object.values(phoneNumbers);
    const telephones = ([] as any[]).concat(...values);
    const telephone = telephones.find((tel) => {
      if (tel?.name) {
        return tel.name.toLowerCase().includes(name.toLowerCase());
      }
    });
    return telephone;
  }
}
