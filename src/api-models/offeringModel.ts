export interface OfferingModel {
  id: string,
  courseId: string,
  location: string,
  capacity: number,
  startAt: string,
  doneAt: string,
  signedUp: number,
  // Trainees on the wait list (not counted in signedUp)
  waiting: number,
}

export type OfferingUpdateModel = Pick<OfferingModel, 'startAt'|'doneAt'|'capacity'>;
