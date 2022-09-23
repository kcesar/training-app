import { action, computed, makeObservable, observable, onBecomeObserved, runInAction } from 'mobx';

import { TrainingTask } from '.';
import AdminStore from './adminStore';
import SignupViewModel, { signupToViewModel } from '../models/signupViewModel';

export interface TaskProgress<T extends TrainingTask> {
  task: T,
  blockedBy: string[],
  completed?: Date,
  status: string,
  registrations: {[offeringId:string]: 'registered'|'waiting' }
}

export type RegistrationAction = 'register'|'leave';

class CourseStore {
  private store: AdminStore;
  @observable courseId: string;
  @observable loadingSignups: boolean = false;
  @observable signups: SignupViewModel[] = [];

  constructor(store: AdminStore, courseId: string) {
    makeObservable(this);
    this.store = store;
    this.courseId = courseId;
    onBecomeObserved(this, 'signups', () => runInAction(() => this.loadSignups()));
  }

  @action.bound
  async loadSignups() {
    this.loadingSignups = true;
    const response = await fetch(`/api/admin/courses/${this.courseId}/signups`);
    const result = await response.json();
    runInAction(() => {
      this.signups = result.map(signupToViewModel);
      this.loadingSignups = false;
    })
  }

  @action.bound
  generateCSV(roster: SignupViewModel[]) {
    let rows = roster.map((s) => [
      s.traineeName,
      s.traineeEmail,
      s.traineePhone
    ].map(t => t ? `"${t}"` : ''));
    rows.unshift(['Name','Email','Phone']);

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `roster-${this.course?.id}.csv`);
    link.click()
    URL.revokeObjectURL(link.href)
  }

  @computed
  get course() {
    const c = this.store.courseList.find(f => f.id === this.courseId);
    if (!c) return undefined;
    return {
      ...c,
      offerings: this.store.offerings[this.courseId],
      signups: this.signups
    };
  }
}

export default CourseStore;