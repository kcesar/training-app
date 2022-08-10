import { action, computed, makeObservable, observable, runInAction } from "mobx";

export class DialogStore {
  @observable private working: boolean = false;
  @observable open: boolean = true;
  onFinish?: () => void;

  constructor(onFinish?: () => void) {
    makeObservable(this);
    this.onFinish = onFinish;
  }

  @computed
  get isWorking() {
    return this.working;
  }
  
  @action.bound
  validate(): Promise<boolean> {
    console.log('base validate');
    return Promise.resolve(true);
  }

  @action.bound
  _submit(): Promise<void> {
    console.log('base submit')
    return Promise.resolve();
  }

  @action.bound
  cancel() {
    this.onFinish?.();
  }

  @action.bound
  async submit() {
    if (await this.validate()) {
      await this._submit();
      runInAction(() => this.open = false);
    }
  }
}