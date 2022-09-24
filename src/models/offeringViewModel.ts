import { parseISO } from 'date-fns';
import { OfferingModel } from '../api-models/offeringModel';
import { format as formatDate, isSameMonth, isSameDay } from 'date-fns';

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

export function formatOfferingDates(o: OfferingViewModel) {
  console.log('offering',o);
  return isSameDay(o.startAt, o.doneAt) ? formatDate(o.startAt, 'MMM do h:mma') :
    formatDate(o.startAt, 'MMM d') + ' - ' + formatDate(o.doneAt, isSameMonth(o.startAt, o.doneAt) ? 'd' : 'MMM do');
}