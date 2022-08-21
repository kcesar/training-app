export interface OfferingModel {
  id: number,
  courseId: string,
  location: string,
  capacity: number,
  startAt: string,
  doneAt: string,
  signedUp: number,
}