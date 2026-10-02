import { createTheme } from '@mui/material';
import { action, computed, makeObservable, observable, onBecomeObserved, runInAction } from 'mobx';
import { Location, Params } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Api from './api';
import LoginModel, { LoginResult } from '../api-models/loginModel';
import UserViewModel, { loginToViewModel } from '../models/userViewModel';
import TraineeStore from './tasksStore';
import { AppChrome } from '../models/appChromeContext';
import OfferingViewModel, { offeringToViewModel } from '../models/offeringViewModel';
import { OfferingModel } from '../api-models/offeringModel';
import { CourseModel } from '../api-models/courseModel';
import { CredentialResponse } from '@react-oauth/google';

interface SiteConfig {
  clientId: string
}

interface BaseTask {
  id: string,
  title: string,
  summary: string,
  prereqs?: string[],
}

export interface SessionTask extends BaseTask {
  category: 'session',
  hours: number,
  startTime?: string,
  endTime?: string,
  offerings: OfferingViewModel[],
}

export interface OnlineTask extends BaseTask {
  category: 'online',
  details: string,
  url: string,
}

export interface PaperworkTask extends BaseTask {
  category: 'paperwork',
  details: string,
}

export type TrainingTask = PaperworkTask|SessionTask|OnlineTask;

class Store implements AppChrome {
  @observable route: { location: Location, params?: Params<string> } = { location: {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    key: '',
    state: null
  } };

  @observable history = createBrowserHistory();

  @observable started: boolean = false;
  @observable user?: UserViewModel;
  @observable loginError?: string;

  @observable config: SiteConfig = { clientId: '' };
  @observable offerings: { [courseId:string]: OfferingViewModel[] } = {};

  @observable allTasks :TrainingTask[] = [];

  constructor() {
    makeObservable(this);
    onBecomeObserved(this, 'offerings', () => this.loadOfferings());
  }

  async start() {
    const [response, courses] = await Promise.all([
      Api.get<{config: SiteConfig, user: LoginResult}>('/api/boot'),
      Api.get<CourseModel[]>('/api/courses'),
    ]);
    runInAction(() => {
      this.setCourses(courses);
      this.config = response.config as SiteConfig;
      this.user = loginToViewModel(response.user);
      this.started = true;
    });
  }

  @action.bound
  async doLogin(data?: CredentialResponse) {
    if (!data || !data.credential) {
      alert('login error');
    } else {
      const res = await Api.post<LoginModel>('/api/auth/google', { token: data.credential });

      runInAction(() => {
        if (res.error) {
          this.loginError = res.error;
          this.user = undefined;
          alert(this.loginError);
        } else {
          console.log('Logging in', res);
          this.user = loginToViewModel(res as LoginResult);
        }
      });
    }
  }

  @action.bound
  setCourses(courses: CourseModel[]) {
    this.allTasks = courses.map(c => ({ ...c, category: 'session', offerings: [] }));
  }

  async loadOfferings() {
    await fetch('/api/offerings').then(r => r.json()).then(json => {
      const j = json as {[courseId:string]: OfferingModel[]};
      runInAction(() => {
        this.offerings = Object.keys(j).reduce((accum, key) => ({ ...accum, [key]: j[key].map(offeringToViewModel)}), {} as {[courseId:string]: OfferingViewModel[]});
      });
    });
  }

  @action.bound
  async doLogout() {
    if (!this.user) return;
    
    await Api.get<{}>('/api/auth/logout', {
      method: 'POST',
      mode: 'same-origin', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({})
    });

    runInAction(() => this.user = undefined);
  }

  @action.bound
  syncRoute(location: Location, params?: Params<string>) {
    this.route = ({ location, params });
  }

  getTraineeStore(forSelf: boolean) {
    return new TraineeStore(this, forSelf);
  }
  
  @computed
  get currentSection() {
    if (this.route.location.pathname.startsWith('/events')) return 'events'; 
    if (this.route.location.pathname.startsWith('/response')) return 'response';
    return '';
  }

  @computed
  get theme() {
    const t = (
      {
        palette: {
          primary: { main: 'rgb(21, 69, 21)' },
        },
      }
    );
    return createTheme(t);
  }
}

export default Store;
