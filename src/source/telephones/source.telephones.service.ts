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
    return allTelephones;
  }
  getByName(name: string) {
    return this.fileStrategy.findByName(name);
  }
}
