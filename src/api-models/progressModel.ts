export interface ProgressModel {
  courseId: string,
  status: 'registered'|'waiting'|'complete',
  completed: string,
  registrations: { [offeringId:string]: {
    status: 'registered'|'waiting',
    isPast?: boolean,
  }},
}