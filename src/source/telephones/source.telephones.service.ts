import { Injectable } from '@nestjs/common';
import { FileStrategy } from './file.strategy';

@Injectable()
export class SourceTelephoneService {
  constructor(private fileStrategy: FileStrategy) {}
  /**
   * bot is not calling this right now
   *
   */
  getTelephones() {
    const allTelephones = this.fileStrategy.getTelephones();
    console.log('Telephones: allTelephones');
    return allTelephones;
  }
  getByName(name: string) {
    const telephonesByName = this.fileStrategy.findByName(name);
    console.log(telephonesByName);
    return telephonesByName;
  }
}
