import { computed, makeObservable, observable } from 'mobx';
import MobxReactForm from 'mobx-react-form';
import dvr from 'mobx-react-form/lib/validators/DVR';
import validatorjs from 'validatorjs';

import Store from '.';
import Api from './api';

class EventCreateStore {
  private store: Store;
  private createForm?: MobxReactForm;

  @observable working: boolean = false;

  constructor(store: Store) {
    makeObservable(this);
    this.store = store;
  }

  getForm() {
    if (!this.createForm) {
      const now = new Date();

      const plugins = {
        dvr: dvr(validatorjs)
      };
      const fields = [
        {
          name: 'name',
          label: 'Event Title',
          rules: 'required|string|between:3,80'
        },
        {
          name: 'number',
          label: 'DEM #',
          rules: 'string|between:5,20'
        },
        {
          type: 'checkbox',
          name: 'isMission',
          label: 'Event is a mission',
          value: true,
        },
        {
          name: 'date',
          label: 'Date',
          value: now,
        },
        {
          name: 'time',
          label: 'Time',
          value: now,
        }
      ];
      
      const hooks = {
        onSuccess: async (form: MobxReactForm) => {
          const { date, time, ...values } = form.values();
          const data = {
            ...values,
            startAt: new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes()),
            units: [ { name: this.store.teamName }],
          }
          console.log('Form values', data);
          this.working = true;

          const result = await (await Api.post<{id:number}>('/api/v1/events', data));

          this.store.history.push(`/events/${result.id}`);

          console.log(result);
        },
        onError(form: MobxReactForm) {
//          alert('Form has errors!');
          // get all form errors
          console.log('All form errors', form.errors());
        }
      };

      this.createForm = new MobxReactForm({ fields }, { options: {}, plugins, hooks });
    }

    return this.createForm;
  }

  @computed
  get mainStore() {
    return this.store;
  }
}

export default EventCreateStore;