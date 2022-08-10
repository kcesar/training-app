import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import Store from '.';
import EventViewModel from '../models/eventViewModel';
import { JoinPageStore } from '../sections/respond/joinPageStore';

class ResponseStore {
  private store: Store;

  @observable joinDialogEventId?: number;
  @observable joinDialogOpen: boolean = false;
  

  constructor(store: Store) {
    makeObservable(this);
    this.store = store;
  }

  @action.bound
  startJoinEvent(event: EventViewModel, joinNow: boolean) {
    this.joinDialogOpen = true;
    this.joinDialogEventId = event.id;
  }

  // @computed
  // get joinStore() {
  //   const event = this.allEvents.find(f => f.id === this.joinDialogEventId);
  //   if (!event) return undefined;
  //   return new JoinPageStore(
  //     this.allEvents.find(f => f.id === this.joinDialogEventId)!,
  //     this,
  //     () => runInAction(() => {
  //       console.log('join event')
  //       this.joinDialogOpen = false;
  //     })
  //   );
  // }

  @computed
  get mainStore() {
    return this.store;
  }

  @computed
  get responses() {
    return this.store.responses;
  }

  @computed
  get allEvents() {
    return this.store.events;
  }

  @computed
  get availableMissions() {
    return this.store.missions.filter(m => m.myUnitResponding);
  }

  @computed
  get availableOtherEvents() {
    return this.store.otherEvents.filter(e => e.myUnitResponding);
  }

  @computed
  get hasOtherEvents() {
    return this.availableOtherEvents.length > 0;
  }
}

export default ResponseStore;