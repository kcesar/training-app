export interface CourseModel {
  id: string,
  title: string,
  summary: string,
  hours: number,
  prereqs: string[],
  // Overnight courses always start and end at these local times ("HH:mm"), ending the day after they start.
  // Courses without them are in-town courses that run for `hours` from any start time.
  startTime?: string,
  endTime?: string,
}

export type CourseSettings = Pick<CourseModel, 'prereqs'|'hours'|'startTime'|'endTime'>;
export type CourseSettingsModel = { [courseId: string]: CourseSettings };
