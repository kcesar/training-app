import ResponderModel from "./responderModel";

export interface EventUnitModel {
  id: number;
  name: string;
  byMember: string;
  createdAt: string;
}

export default interface EventModel {
  id: number;
  name: string;
  number?: string;
  isMission: boolean;
  startAt: string;
  createdAt: string;
  units: EventUnitModel[];
  responders: ResponderModel[];
}