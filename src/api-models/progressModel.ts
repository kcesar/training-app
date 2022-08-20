export interface ProgressModel {
  courseId: string,
  status: 'registered'|'waiting'|'complete',
  completed: string,
  registrations: string[],
}