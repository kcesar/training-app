import { computed, makeObservable, observable, runInAction } from 'mobx';
import { set as setDateParts, parseISO } from 'date-fns';

import Store from '.';
import Api from './api';
import EventModel from '../../../api-models/eventModel';
import { responderToViewModel } from '../models/responderViewModel';

class EventDetailStore {
  private store: Store;
  private eventId?: number;
  @observable private originalEvent?: EventModel = undefined;
  @observable doingNetwork: boolean = false;

  @observable name: string = '';
  @observable number?: string;
  @observable startAt: Date = setDateParts(new Date(), {seconds: 0, milliseconds: 0});
  
  constructor(store: Store, eventId?: number) {
    makeObservable(this);
    this.store = store;
    this.eventId = eventId;
  }

  async start() {
    if (!this.eventId || this.originalEvent) return;

    this.doingNetwork = true;
    const event = await Api.get<EventModel>(`/api/v1/events/${this.eventId}`);
    runInAction(() => {
      this.originalEvent = event
      this.doingNetwork = false;
      this.name = event.name;
      this.number = event.number;
      this.startAt = parseISO(event.startAt);
    });
  }

  @computed
  get mainStore() {
    return this.store;
  }

  @computed
  get units() {
    return this.originalEvent?.units ?? [];
  }

  getUnit(unitId: number) {
    return this.units.find(u => u.id === unitId);
  }

  @computed
  get responders() {
    return this.originalEvent?.responders?.map(responderToViewModel) ?? [];
  }
}

export default EventDetailStore;