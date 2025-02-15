import { Injectable } from '@nestjs/common';
import phoneNumbers from './telephones.json';
@Injectable()
export class FileStrategy {
  constructor() {}

  getTelephones() {
    return phoneNumbers;
  }
  findByName(name: string): any {
    const telephones = ([] as any[]).concat(...Object.values(phoneNumbers));
    return telephones.find((tel) =>
      tel.name.toLowerCase().includes(name.toLowerCase()),
    );
  }
}
