import { parseISO } from 'date-fns';
import { OfferingModel } from '../api-models/offeringModel';
import { format as formatDate, isSameMonth, isSameDay, isSameYear, isThisYear } from 'date-fns';

export default interface OfferingViewModel extends Omit<OfferingModel, 'startAt'|'doneAt'> {
  startAt: Date,
  doneAt: Date,
}

export const offeringToViewModel = (api: OfferingModel) => {
    return ({
    ...api,
    startAt: parseISO(api.startAt),
    doneAt: parseISO(api.doneAt),
    signedUp: api.signedUp ?? 0,
    waiting: api.waiting ?? 0,
  } as OfferingViewModel);
}

export function formatOfferingDates(o: OfferingViewModel) {
  console.log('offering',o);
  return isSameDay(o.startAt, o.doneAt) ? formatDate(o.startAt, 'MMM do h:mma') :
    formatDate(o.startAt, 'MMM d') + ' - ' + formatDate(o.doneAt, isSameMonth(o.startAt, o.doneAt) ? 'd' : 'MMM do');
}

// Compact form for lists, e.g. "Sep 10", "Oct 29–30", "Jan 31 – Feb 1 2027"
export function formatOfferingDatesShort(o: OfferingViewModel) {
  const year = isThisYear(o.startAt) && isThisYear(o.doneAt) ? '' : ' yyyy';
  if (isSameDay(o.startAt, o.doneAt)) return formatDate(o.startAt, 'MMM d' + year);
  if (isSameMonth(o.startAt, o.doneAt)) return formatDate(o.startAt, 'MMM d') + '–' + formatDate(o.doneAt, 'd' + year);
  return formatDate(o.startAt, 'MMM d' + (isSameYear(o.startAt, o.doneAt) ? '' : year)) + ' – ' + formatDate(o.doneAt, 'MMM d' + year);
}

// Full form with times, e.g. "Sat Sep 10, 9:00 AM – 6:00 PM" or "Sat Oct 29, 6:30 AM – Sun Oct 30, 4:00 PM"
export function formatOfferingDateTimes(o: Pick<OfferingViewModel, 'startAt'|'doneAt'>) {
  const dayTime = 'EEE MMM d' + (isThisYear(o.startAt) && isThisYear(o.doneAt) ? '' : ' yyyy') + ', h:mm a';
  return formatDate(o.startAt, dayTime) + ' – ' + formatDate(o.doneAt, isSameDay(o.startAt, o.doneAt) ? 'h:mm a' : dayTime);
}

// e.g. "12 of 30 registered · 18 spots open", "30 of 30 registered · Full · 4 waiting"
export function formatRegistrationStatus(registered: number, capacity: number, waiting = 0) {
  const open = capacity - registered;
  const detail = open > 0 ? `${open} ${open === 1 ? 'spot' : 'spots'} open` : open === 0 ? 'Full' : `${-open} over capacity`;
  return `${registered} of ${capacity} registered · ${detail}` + (waiting > 0 ? ` · ${waiting} waiting` : '');
}
