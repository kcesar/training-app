import { parseISO } from 'date-fns';
import { ProgressModel } from '../api-models/progressModel';

export default interface ProgressViewModel extends Omit<ProgressModel, 'completed'> {
  completed: Date,
}

export const progressToViewModel = (api: ProgressModel) => {
    return ({
    ...api,
    completed: api.completed ? parseISO(api.completed) : undefined,
    registrations: api.registrations ?? {},
  } as ProgressViewModel);
}