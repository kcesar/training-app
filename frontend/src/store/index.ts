import { createTheme } from '@mui/material';
import { action, computed, makeObservable, observable, onBecomeObserved, runInAction } from 'mobx';
import { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { Location, Params } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Api from './api';
import EventModel from '../../../api-models/eventModel';
import LoginModel, { LoginResult } from '../../../api-models/loginModel';
import ResponderModel from '../../../api-models/responderModel';
import EventEditStore from './eventEditStore';
import EventDetailStore from './eventDetailStore';
import EventViewModel, { eventToViewModel } from '../models/eventViewModel';
import ResponderViewModel, { responderToViewModel } from '../models/responderViewModel';
import UserViewModel, { loginToViewModel } from '../models/userViewModel';
import TraineeStore from './traineeStore';
import { formatISO, startOfMinute } from 'date-fns';
import { AppChrome } from '../models/appChromeContext';

interface SiteConfig {
  clientId: string
}

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
  @observable isOnline: boolean = navigator.onLine;
  @observable user?: UserViewModel;
  @observable loginError?: string;

  @observable config: SiteConfig = { clientId: '' };

  @observable events: EventViewModel[] = [];
  @observable responses: ResponderViewModel[] = [];

  constructor() {
    makeObservable(this);
    onBecomeObserved(this, 'events', async () => {
      const res = (await Api.get<{data: EventModel[]}>("/api/v1/events")).data;
      runInAction(() => this.events = res.map((e :EventModel) => eventToViewModel(e)));
    })
    onBecomeObserved(this, 'responses', async () => {
      const res = (await Api.get<{data: ResponderModel[]}>("/api/v1/responses")).data;
      runInAction(() => this.responses = res.map((r :ResponderModel) => responderToViewModel(r)));
    })
  }

  async start() {
    window.addEventListener('online', this.setOfflineStatus)
    window.addEventListener('offline', this.setOfflineStatus)
    const response = await Api.get<{config: SiteConfig, user: LoginResult}>('/api/boot');
    runInAction(() => {
      this.config = response.config as SiteConfig;
      this.user = loginToViewModel(response.user);
      this.started = true;
    });
  }

  @action.bound
  private setOfflineStatus() {
    this.isOnline = navigator.onLine;
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

  getEventStore(eventId?: number) {
    return new EventDetailStore(this, eventId);
  }

  getEditEventStore(eventId?: number) {
    return new EventEditStore(this);
  }

  getTraineeStore() {
    return new TraineeStore(this);
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
