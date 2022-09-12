import { action, makeObservable, observable, onBecomeObserved, runInAction } from "mobx";
import Store from ".";
import UserModel from "../api-models/userModel";

class AdminStore {
  private store: Store;

  @observable trainees: UserModel[] = [];
  @observable loadingTrainees: boolean = false;

  constructor(store: Store) {
    this.store = store;
    makeObservable(this);
    onBecomeObserved(this, 'trainees', () => this.loadTrainees());
  }

  @action.bound
  private async loadTrainees() {
    this.loadingTrainees = true;
    const response = await fetch(`/api/admin/trainees`);
    const result = await response.json();
    runInAction(() => {
      this.trainees = result;
      this.loadingTrainees = false;
    })
  }

  getTraineeStore(params: Partial<{email: string}>) {
    const store = this.store.getTraineeStore(false);
    store.setTrainee(params.email, this.trainees.find(f => f.primaryEmail === params.email)?.name?.fullName ?? 'Not found')
    return store;
  }
}

export default AdminStore;