import { parseISO } from 'date-fns';
import { OfferingModel } from '../api-models/offeringModel';

export default interface OfferingViewModel extends Omit<OfferingModel, 'startAt'|'doneAt'> {
  startAt: Date,
  doneAt: Date,
}

export const offeringToViewModel = (api: OfferingModel) => {
    return ({
    ...api,
    startAt: parseISO(api.startAt),
    doneAt: parseISO(api.doneAt),
    signedUp: api.signedUp ?? 0
  } as OfferingViewModel);
}