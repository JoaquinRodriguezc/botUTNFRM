import { Injectable } from '@nestjs/common';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Response } from 'express';
import { readFile } from 'fs/promises';
import * as path from 'path';

const MATERIAS_FILE_PATH = path.join(
  __dirname,
  '..',
  '..',
  'docs',
  'parsed',
  'materias_por_archivo.json',
);

interface MateriasMap {
  [key: string]: string[];
}

@Injectable()
export class IaService {
  private materiasPorArchivo: MateriasMap | null = null;

  async loadMaterias(): Promise<MateriasMap> {
    try {
      if (this.materiasPorArchivo) {
        return this.materiasPorArchivo;
      }

      const materiasContent = await readFile(MATERIAS_FILE_PATH, 'utf-8');
      this.materiasPorArchivo = JSON.parse(materiasContent);
      return this.materiasPorArchivo;
    } catch (error) {
      console.error('Error loading materias:', error);
      throw new Error(`Failed to load materias: ${error.message}`);
    }
  }

  async getMateriasByFile(fileName?: string): Promise<MateriasMap | string[]> {
    try {
      const materias = await this.loadMaterias();

      if (fileName && fileName in materias) {
        return materias[fileName];
      }

      return materias;
    } catch (error) {
      console.error('Error getting materias:', error);
      throw new Error(`Failed to get materias: ${error.message}`);
    }
  }

  async processChatStream(response: Response) {
    try {
      const materias = await this.loadMaterias();
      const materiasString = JSON.stringify(materias, null, 2);

      const { textStream } = streamText({
        model: openai('gpt-4o'),
        system: `# Instructions for the Model
*Context:* You are an assistant tasked with interpreting all user questions. All responses must be in Spanish.
### Special Rules
2. *Completing Subject Names:* If the user does not provide the full name of a subject, complete it automatically.
   - Examples:
     - "Análisis de Sistemas" -> "Análisis de Sistemas de Información"
     - "Álgebra" -> "Álgebra y Geometría Analítica"
     - "Sintaxis" -> "Sintaxis y Semántica de los Lenguajes"
   - Add "(Elec.)" for elective subjects if the user omits it but the subject belongs to the electives list.
### Subject List
${materiasString}



*Instructions for the Model:* Ensure all responses are in Spanish.

## IMPORTANT
- Your ability to detect errors and provide clear feedback will enhance the user experience.`,
        prompt: '¿Qué materias hay en el json parsed-0?',
      });

      // Configurar headers para streaming
      response.setHeader('Content-Type', 'text/event-stream');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'keep-alive');

      // Stream cada parte de la respuesta
      for await (const textPart of textStream) {
        response.write(`data: ${textPart}\n\n`);
      }

      response.end();
    } catch (error) {
      console.error('Error en procesamiento de IA:', error);
      throw new Error(`Fallo en el servicio de IA: ${error.message}`);
    }
  }
}
