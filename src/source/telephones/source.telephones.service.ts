import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SourceTelephoneService {
  private telephones: any[];

  constructor() {
    const dataPath = path.join(__dirname, '..', 'data', 'telephones.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    this.telephones = JSON.parse(rawData);
  }

  findAll(): any[] {
    return this.telephones;
  }

  findOne(id: number): any {
    return this.telephones.find((telephone) => telephone.id === id);
  }

  create(telephone: any): void {
    this.telephones.push(telephone);
    this.saveData();
  }

  update(id: number, updatedTelephone: any): void {
    const index = this.telephones.findIndex((telephone) => telephone.id === id);
    if (index !== -1) {
      this.telephones[index] = updatedTelephone;
      this.saveData();
    }
  }

  delete(id: number): void {
    this.telephones = this.telephones.filter(
      (telephone) => telephone.id !== id,
    );
    this.saveData();
  }

  private saveData(): void {
    const dataPath = path.join(__dirname, '..', 'data', 'telephones.json');
    fs.writeFileSync(
      dataPath,
      JSON.stringify(this.telephones, null, 2),
      'utf8',
    );
  }
  getTelephones(): any[] {
    return this.telephones;
  }

  findByName(name: string): any {
    const allTelephones = this.telephones.concat(
      ...Object.values(this.telephones),
    );
    return allTelephones.find((tel) =>
      tel.name.toLowerCase().includes(name.toLowerCase()),
    );
  }
}
