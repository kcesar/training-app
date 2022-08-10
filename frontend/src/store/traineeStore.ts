import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import Store from '.';

class TraineeStore {
  private store: Store;

  @observable joinDialogEventId?: number;  

  constructor(store: Store) {
    makeObservable(this);
    this.store = store;
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



}

export default TraineeStore;