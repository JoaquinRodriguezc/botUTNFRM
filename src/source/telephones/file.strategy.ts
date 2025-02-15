import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileStrategy {
  private phoneNumbers: any;

  constructor() {
    this.loadPhoneNumbers();
  }

  private loadPhoneNumbers(): void {
    const jsonPath = path.join(__dirname, 'telephones.json');
    try {
      const content = fs.readFileSync(jsonPath, 'utf-8');
      this.phoneNumbers = JSON.parse(content);
    } catch (error) {
      console.error('Error al cargar telephones.json desde', jsonPath, error);
      this.phoneNumbers = null;
    }
  }

  getTelephones() {
    if (!this.phoneNumbers) {
      this.loadPhoneNumbers();
    }
    return this.phoneNumbers;
  }

  findByName(name: string): any {
    const phoneNumbers = this.getTelephones();
    if (!phoneNumbers) {
      console.error('Error: phoneNumbers es undefined o null.');
      return null;
    }
    const values = Object.values(phoneNumbers);
    const telephones = ([] as any[]).concat(...values);
    const telephone = telephones.find((tel) => {
      if (!tel?.name) {
        console.error('Teléfono sin propiedad "name":', tel);
        return false;
      }
      return tel.name.toLowerCase().includes(name.toLowerCase());
    });
    if (!telephone) {
      console.warn(
        `No se encontró ningún teléfono que incluya "${name}" en su nombre.`,
      );
    }
    console.log(telephone);
    return telephone;
  }
}
