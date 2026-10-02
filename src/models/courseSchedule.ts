import { format as formatDate } from 'date-fns';
import { CourseModel } from '../api-models/courseModel';

type Schedule = Pick<CourseModel, 'hours'|'startTime'|'endTime'>;

export function isOvernight(course: Schedule) {
  return !!course.startTime && !!course.endTime;
}

function atTime(day: Date, time: string, addDays = 0) {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + addDays, hours, minutes);
}

// The offering's start and end times for a chosen start. Overnight courses only use the date of `start`.
export function scheduleOffering(course: Schedule, start: Date): { startAt: Date, doneAt: Date } {
  if (isOvernight(course)) {
    return { startAt: atTime(start, course.startTime!), doneAt: atTime(start, course.endTime!, 1) };
  }
  const doneAt = new Date(start);
  doneAt.setMinutes(doneAt.getMinutes() + Math.round(course.hours * 60));
  return { startAt: start, doneAt };
}

// "06:30" -> "6:30 AM"
export function formatTimeOfDay(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return formatDate(new Date(2000, 0, 1, hours, minutes), 'h:mm a');
}
