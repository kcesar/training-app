import { action, computed, makeObservable, observable, onBecomeObserved, onBecomeUnobserved, reaction, runInAction } from 'mobx';
import { format as formatDate } from 'date-fns';

import Store, { TrainingTask } from '.';
import OfferingViewModel from '../models/offeringViewModel';
import ProgressViewModel, { progressToViewModel } from '../models/progressViewModel';

export interface TaskProgress<T extends TrainingTask> {
  task: T,
  blockedBy: string[],
  completed?: Date,
  status: string,
  registrations: {[offeringId:string]: 'registered'|'waiting' }
}

export type RegistrationAction = 'register'|'leave';

class TasksStore {
  private store: Store;
  @observable private _traineeId?: string;
  @observable private _traineeName?: string;
  private useSignedInUser: boolean = false;
  @observable private doLoadProgress: boolean = false;

  @observable traineeProgress?: { [courseId: string]: ProgressViewModel };

  @observable registerPrompt :{
    open: boolean,
    offeringId: string,
    action: RegistrationAction,
    actionText?: string,
    title?: string,
    body?: string,
    working?: boolean,
    error?: string,
  } = {
    open: false,
    offeringId: '',
    action: 'register',
  }

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
  setTrainee(email?: string, name?: string) {
    this.useSignedInUser = false;
    this._traineeName = name;
    if (this.traineeId !== email) {
      this._traineeId = email;
      this.traineeProgress = {};
      this.loadProgress();
    }
  }

  @action.bound
  async startRegistration(offering: OfferingViewModel, action: RegistrationAction) {
    this.registerPrompt = {
      open: true,
      offeringId: offering.id,
      action,
      actionText: 'Register',
      title: 'Register',
      body: `Register for ${this.selected?.task.title} on ${formatDate(offering.startAt, 'MMM do')}?`,
    };

    if (action === 'leave') {
      this.registerPrompt.actionText = 'Leave';
      this.registerPrompt.title = 'Leave';
      this.registerPrompt.body = `Give up your spot in ${this.selected?.task.title} on ${formatDate(offering.startAt, 'MMM do')}?`;
    }
  }

  @action.bound
  async confirmRegistration(confirm: boolean) {
    if (!confirm) {
      this.registerPrompt = { ...this.registerPrompt, open: false };
      return;
    }

    this.registerPrompt = { ...this.registerPrompt, error: undefined, working: true };

    try {
      const response = await fetch(`/api/offerings/${this.registerPrompt.offeringId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ traineeEmail: this.traineeId, action: this.registerPrompt.action })
      });

      if (!response.ok) {
        throw (await response.json()).message ?? 'Unknown error';
      }

      runInAction(() => {
        this.loadProgress().then(() => runInAction(() => {
          this.store.loadOfferings().then(() => runInAction(() => {
            this.registerPrompt = { ...this.registerPrompt, open: false };
          }))
        }));
      });
    } catch (err) {
      runInAction(() => this.registerPrompt = { ...this.registerPrompt, error: err + '' });
    } finally {
      runInAction(() => this.registerPrompt = { ...this.registerPrompt, working: false });
    }
  }

  private async loadProgress() {
    if (!this.doLoadProgress) return;

    if (this.traineeId) {
      await (fetch(`/api/progress/${this.traineeId}`)
      .then(r => r.json())
      .then(j => {
        runInAction(() => {
          this.traineeProgress = Object.keys(j).reduce((accum, key) => ({ ...accum, [key]: progressToViewModel(j[key])}), {} as {[courseId:string]: ProgressViewModel});
        });
      }));
    }
  }

  @computed
  get coursesRoot() {
    return this.useSignedInUser ? '/' : `/admin/trainees/${this.traineeId}/`;
  }

  @computed
  get showHeader() {
    return !this.useSignedInUser && !!this.traineeId;
  }

  @computed
  get traineeId() {
    return this.useSignedInUser ? (this.store.user?.email) : this._traineeId;
  }

  @computed
  get traineeName() {
    return this.useSignedInUser ? (this.store.user?.name) : this._traineeName;
  }

  @computed
  get allTasks(): TaskProgress<TrainingTask>[] {
    return this.store.allTasks.map(t => ({
      task: t.category === 'session' ? { ...t, offerings: this.store.offerings[t.id] ?? []} : t,
      blockedBy: (t.prereqs ?? []).filter(c => this.blockedByFilter(c)),
      completed: this.traineeProgress?.[t.id]?.completed,
      registrations: this.traineeProgress?.[t.id]?.registrations ?? {},
      status: this.traineeProgress?.[t.id]?.status ?? '',
    }));
  }

  private blockedByFilter(prereqCourseId: string) {
    return !(this.traineeProgress?.[prereqCourseId]?.completed);
  }

  @computed
  get selected(): TaskProgress<TrainingTask>|undefined {
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

  getCourseTitle(courseId: string) {
    return this.allTasks.find(f => f.task.id === courseId)?.task.title;
  }

  @computed
  get userIsAdmin(): boolean {
    return !!this.store.user && !this.store.user.isTrainee;
  }
}

export default TasksStore;