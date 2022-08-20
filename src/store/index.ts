import { createTheme } from '@mui/material';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { Location, Params } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Api from './api';
import LoginModel, { LoginResult } from '../api-models/loginModel';
import UserViewModel, { loginToViewModel } from '../models/userViewModel';
import TraineeStore from './tasksStore';
import { AppChrome } from '../models/appChromeContext';

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

  @observable allTasks :TrainingTask[] = [
    // { title: 'Contact Information', summary: 'Address, Email, Phone Number', category: 'personal' },
    // { title: 'Emergency Contacts', summary: 'Who to call in an emergency', category: 'personal' },
    { id: 'fa-card', title: 'First Aid', summary: 'American Heart (AHA), Red Cross (ARC) or equivalent First Aid card', category: 'paperwork', details: 'Submit a scan or picture of a current first aid card to training.admin@kcesar.org' },
    { id: 'cpr-card', title: 'CPR', summary: 'American Heart (AHA), Red Cross (ARC) or equivalent CPR card', category: 'paperwork', details: 'Submit a scan or picture of a current CPR card to training.admin@kcesar.org' },
    { id: 'ics-100', title: 'ICS-100', summary: 'FEMA required online course', category: 'online', details: 'ICS 100, Introduction to the Incident Command System, introduces the Incident Command System (ICS) and provides the foundation for higher level ICS training. This course describes the history, features and principles, and organizational structure of the Incident Command System. It also explains the relationship between ICS and the National Incident Management System (NIMS).', url:'https://training.fema.gov/is/courseoverview.aspx?code=IS-100.c' },
    { id: 'ics-700', title: 'ICS-700', summary: 'FEMA required online course', category: 'online', details: 'This course introduces and overviews the National Incident Management System (NIMS). NIMS provides a consistent nationwide template to enable all government, private-sector, and nongovernmental organizations to work together during domestic incidents.', url:'https://training.fema.gov/is/courseoverview.aspx?code=IS-700.b', },
    //{ title: 'Course A', summary: 'Evening orientation', category: 'session', details: 'This is an in-town weeknight informational meeting used to present ESAR objectives, organization and procedures.\n\nDiscussions center on basic training course content, requirements for team member field qualification, and personal equipment needs.', hours: 2},
    { id: 'course-b', title: 'Course B', summary: 'Indoor navigation course', category: 'session', hours: 9 },
    { id: 'course-c', title: 'Course C', summary: "Outdoor weekend - Intro to SAR", category: 'session', hours: 32.5, prereqs: ['course-b', /*'ESAR F/A - Basic' /*, 'Background Check', 'LFL Registration'*/] },
    { id: 'fa-intro', title: 'Intro to Searcher First Aid', summary: '', category: 'session', hours: 9, prereqs: ['course-b']},
    //{ title: 'Background Check', summary: "Sheriff's Office application", category: 'paperwork', details: 'All potential KCESAR members submit an application to the King County Sheriff\'s office, who will conduct a criminal background check on the applicant.\n\nThis status will be updated when we are informed that you have passed this check. KCESAR does not receive the result of the background check except a pass/fail from the sheriff\'s office.' },
    //{ title: 'LFL Registration', summary: "For youth members", category: 'paperwork' },
//      { title: 'Submit Photo', summary: "Submit portrait for ID card", category: 'paperwork' },
    { id: 'course-1', title: 'Course I', summary: "Outdoor weekend - Navigation", category: 'session', prereqs: ['course-c'], hours: 31 },
    { id: 'course-2', title: 'Course II', summary: "Outdoor weekend - Evaluation", category: 'session', prereqs: ['course-1'], hours: 31 },
    { id: 'fa-searcher', title: 'Searcher First Aid', summary: 'SAR specific first aid and scenarios', category: 'session', hours: 9, prereqs: ['course-2', 'fa-intro']},
    { id: 'course-3', title: 'Course III', summary: "Outdoor weekend - mock mission", category: 'session', prereqs: ['fa-searcher', 'ics-100', 'ics-700'], hours: 31 },
    { id: 'graduation', title: 'ESAR Ops Orientation', summary: 'Information for new graduates about responding to missions, etc.', category: 'session', prereqs: ['course-3'], hours: 3 }
  ];

  constructor() {
    makeObservable(this);
  }

  async start() {
    const response = await Api.get<{config: SiteConfig, user: LoginResult}>('/api/boot');
    runInAction(() => {
      this.config = response.config as SiteConfig;
      this.user = loginToViewModel(response.user);
      this.started = true;
    });
  }

  @action.bound
  async doLogin(data:GoogleLoginResponse|GoogleLoginResponseOffline) {
    this.loginError = undefined;

    if (!!data.code) {
      alert(`login error code:${data.code}`)
    } else {
      const loginData = data as GoogleLoginResponse;

      const res = await Api.post<LoginModel>("/api/auth/google", { token: loginData.tokenId });

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
