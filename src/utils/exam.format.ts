import { Subject } from '../source/source.types';
import { FinalExam } from '../source/source.types';
import { ScheduleEntry } from '../source/source.types';

export function formatExamDates(subject: Subject, examDays: ScheduleEntry[]): string {
if (examDays.length === 0) {
    return `No se encontraron fechas de exámenes finales para la siguiente materia: ${subject}`;
}

let result = 
    `📚 *Materia*: ${subject.name}\n\n`;
    examDays.forEach((exam) => {
    if (examDays.indexOf(exam) === 0) {
        result += `
        🎉 *Próxima mesa*: ${exam.day}\n`;
        if (exam.startTime && exam.endTime) {
            result += `🕒 *Hora Inicio*: ${exam.startTime} 🕒 *Hora Fin*: ${exam.endTime}\n\n`;
        }
        result += `*📅 Otras fechas:*\n`;
    } else {
        result += ` - ${exam.day}`;
        if (exam.startTime && exam.endTime) {
            result += `🕒 *Hora Inicio*: ${exam.startTime} 🕒 *Hora Fin*: ${exam.endTime}\n`;
        }
    }
});

  return result;
}
  