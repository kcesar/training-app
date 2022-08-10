import { parseISO } from "date-fns";
import EventModel from "../../../api-models/eventModel";
import ResponderViewModel, { responderToViewModel } from "./responderViewModel";


export default interface EventViewModel extends Omit<EventModel, 'startAt'|'responders'> {
  startAt: Date,
  responders: ResponderViewModel[],
  myUnitResponding: boolean,
}

export const eventToViewModel = (api: EventModel) => {
console.log('mapping event view', parseISO(api.startAt))
  return ({
  ...api,
  responders: api.responders.map(responderToViewModel),
  startAt: parseISO(api.startAt),
  myUnitResponding: false,
} as EventViewModel);
}