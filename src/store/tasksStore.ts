import { action, computed, makeObservable, observable, onBecomeObserved, onBecomeUnobserved, reaction, runInAction } from 'mobx';

import Store, { TrainingTask } from '.';
import ProgressViewModel from '../models/progressViewModel';

export interface TaskProgress {
  task: TrainingTask,
  blockedBy: string[],
  completed?: Date
}

class TasksStore {
  private store: Store;
  private _traineeId?: string;
  private _traineeName?: string;
  private useSignedInUser: boolean = false;
  @observable private doLoadProgress: boolean = false;

  @observable traineeProgress?: { [courseId: string]: ProgressViewModel };

  constructor(store: Store, forSelf: boolean) {
    makeObservable(this);
    this.store = store;
    this.useSignedInUser = forSelf;
    onBecomeObserved(this, 'traineeProgress', () => runInAction(() => this.doLoadProgress = true));
    onBecomeUnobserved(this, 'traineeProgress', () => runInAction(() => this.doLoadProgress = false));
    reaction(
      () => ({ traineeId: this.traineeId, doLoad: this.doLoadProgress }),
      () => this.loadProgress(),
      { fireImmediately: true }
    );
  }

  @action.bound
  async setTrainee(email?: string, name?: string) {
    this.useSignedInUser = false;
    this._traineeName = name;
    if (this.traineeId !== email) {
      this._traineeId = email;
      this.loadProgress();
    }

    return Promise.resolve();
  }

  private loadProgress() {
    if (!this.doLoadProgress) return;

    this.traineeProgress = {};
    if (this.traineeId) {
      fetch(`/api/progress/${this.traineeId}`)
      .then(r => r.json())
      .then(j => {
        runInAction(() => {
          this.traineeProgress = j;
        });
      })
    }
  }

  @computed
  get traineeId() {
    return this.useSignedInUser ? this.store.user?.email : this._traineeId;
  }

  @computed
  get traineeName() {
    return this.useSignedInUser ? this.store.user?.name : this._traineeName;
  }

  @computed
  get allTasks(): TaskProgress[] {
    return this.store.allTasks.map(t => ({
      task: t,
      blockedBy: (t.prereqs ?? []).filter(c => this.blockedByFilter(c)),
      completed: this.traineeProgress?.[t.id]?.completed,
    }));
  }

  private blockedByFilter(prereqCourseId: string) {
    return !(this.traineeProgress?.[prereqCourseId]?.completed);
  }

  @computed
  get selected(): TaskProgress|undefined {
    const courseId = this.store.route.params?.courseId;
    if (!courseId) return undefined;

    return this.allTasks.find(p => p.task.id === courseId);
  }

  @computed
  get closeDetailsLink(): string {
    let dest = this.store.route.location.pathname;
    if (this.store.route.params?.courseId) {
      dest = dest.split('/').slice(0,-1).join('/');
    }
    return dest;
  }
}

export default TasksStore;