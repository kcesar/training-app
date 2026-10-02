export interface SignupModel {
  id: string,
  offeringId: string,
  traineeEmail: string,
  traineeName: string,
  traineePhone?: string,
  onWaitList: boolean,
}