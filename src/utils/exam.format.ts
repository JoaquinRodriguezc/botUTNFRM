import { FinalExam } from '../source/source.types';

export function formatExamDates(exam: FinalExam): string {
if (exam.examDays.length === 0) {
    return `No se encontraron fechas de exámenes finales para la siguiente materia: ${exam.subjectName}`;
}

let result = 
    `📚 *Materia*: ${exam.subjectName}\n\n`;
    exam.examDays.forEach((examDay) => {
        if (exam.examDays.indexOf(examDay) === 0) {
            result += `
            🎉 *Próxima mesa*: ${examDay.day}\n`;
            if (examDay.startTime && examDay.endTime) {
                result += `🕒 *Hora Inicio*: ${examDay.startTime} 🕒 *Hora Fin*: ${examDay.endTime}\n\n`;
            }
            result += `*📅 Otras fechas:*\n`;
        } else {
            result += ` - ${examDay.day}`;
            if (examDay.startTime && examDay.endTime) {
                result += `🕒 *Hora Inicio*: ${examDay.startTime} 🕒 *Hora Fin*: ${examDay.endTime}\n`;
            }
        }
    });

  return result;
}
  