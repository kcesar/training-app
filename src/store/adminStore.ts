import { action, computed, makeObservable, observable, onBecomeObserved, runInAction } from "mobx";
import Store, { SessionTask } from ".";
import UserModel from "../api-models/userModel";
import { CourseModel, CourseSettingsModel } from "../api-models/courseModel";
import { OfferingUpdateModel } from "../api-models/offeringModel";
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

  async saveCourseSettings(settings: CourseSettingsModel) {
    const response = await fetch('/api/admin/courses/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message ?? 'Failed to save');
    this.store.setCourses(result as CourseModel[]);
  }

  async updateOffering(offeringId: string, update: OfferingUpdateModel) {
    const response = await fetch(`/api/admin/offerings/${offeringId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(update)
    });
    if (!response.ok) throw new Error((await response.json()).message ?? 'Failed to save');
    await this.store.loadOfferings();
  }

  async createOffering(courseId: string, offering: OfferingUpdateModel) {
    const response = await fetch(`/api/admin/courses/${courseId}/offerings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offering)
    });
    if (!response.ok) throw new Error((await response.json()).message ?? 'Failed to add');
    await this.store.loadOfferings();
  }

  async deleteOffering(offeringId: string, d4hConfirmed: boolean) {
    const response = await fetch(`/api/admin/offerings/${offeringId}?d4hConfirmed=${d4hConfirmed}`, { method: 'DELETE' });
    if (!response.ok) throw new Error((await response.json()).message ?? 'Failed to remove');
    await this.store.loadOfferings();
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