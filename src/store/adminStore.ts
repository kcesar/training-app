import { action, computed, makeObservable, observable, onBecomeObserved, runInAction } from "mobx";
import Store, { SessionTask } from ".";
import UserModel from "../api-models/userModel";
import CourseStore from "./courseStore";

class AdminStore {
  private store: Store;
  private courseStore?: CourseStore;

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

  @computed
  get courseList() {
    return this.store.allTasks.filter(f => f.category === 'session').map(t => t as SessionTask);      
  }

  @computed
  get offerings() {
    return this.store.offerings;
  }

  getTraineeStore(params: Partial<{email: string}>) {
    const store = this.store.getTraineeStore(false);
    store.setTrainee(params.email, this.trainees.find(f => f.primaryEmail === params.email)?.name?.fullName ?? 'Not found')
    return store;
  }

  getCourseStore(courseId: string) {
    if (this.courseStore?.courseId !== courseId) {
      this.courseStore = new CourseStore(this, courseId);
    }
    return this.courseStore!;
  }

  @computed
  get adminName() {
    return this.store.user?.name;
  }
}

export default AdminStore;