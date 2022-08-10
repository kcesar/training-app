import { differenceInMinutes, parseISO } from "date-fns";
import ResponderModel from "../../../api-models/responderModel";

export default interface ResponderViewModel extends Omit<ResponderModel, 'eta' | 'responding' | 'timeOut'> {
  eta?: Date;
  responding?: Date;
  timeOut?: Date;
  readonly hours?: number;
};

export const responderToViewModel = (api: ResponderModel) => ({
  ...api,
  eta: api.eta ? parseISO(api.eta) : undefined,
  responding: api.responding ? parseISO(api.responding) : undefined,
  timeOut: api.timeOut ? parseISO(api.timeOut) : undefined,
  get hours() {
    if (!this.responding || !this.timeOut) return undefined;
    return Math.round(differenceInMinutes(this.responding, this.timeOut) / 15) / 4;
  }
} as ResponderViewModel);