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
import ResponseStore from './responseStore';
import { formatISO, startOfMinute } from 'date-fns';
import { AppChrome } from '../models/appChromeContext';

interface SiteConfig {
  clientId: string
}

interface UnitDefn {
  id: string,
  name:string,
}

interface SiteTeam {
  name: string,
  background: string
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
  @observable units: UnitDefn[] = [];

  @observable config: SiteConfig = { clientId: '' };

  @observable private siteTeam?: SiteTeam;

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
    this.mapUnitResponder = this.mapUnitResponder.bind(this);
  }

  async start() {
    window.addEventListener('online', this.setOfflineStatus)
    window.addEventListener('offline', this.setOfflineStatus)
    const response = await Api.get<{config: SiteConfig, user: LoginResult, units: UnitDefn[], siteTeam?: SiteTeam}>('/api/boot');
    runInAction(() => {
      this.config = response.config as SiteConfig;
      this.user = loginToViewModel(response.user);
      this.units = response.units;
      this.started = true;

      this.siteTeam = response.siteTeam;
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
  async respondToEvent(event: EventViewModel, when?: Date) {
    if (!this.user) {
      throw new Error('User not logged in');
    }

    const eventUnit = event.units.find(u => u.name === this.siteTeam?.name);
    if (!eventUnit) {
      alert('Response joins unit to event.');
      return;
    }

    const data :Omit<ResponderModel, 'id'> = {
      name: this.user.name,
      email: this.user.email,
      eventId: event.id,
      unitId: eventUnit.id,
      eta: when ? formatISO(startOfMinute(when)) : undefined,
      responding: when ? undefined : formatISO(startOfMinute(new Date())),
    };

    const response = await Api.post('/api/v1/responses', data);
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

  getResponseStore() {
    return new ResponseStore(this);
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
          primary: { main: this.siteTeam?.background ?? '#0000ff' },
        },
      }
    );
    return createTheme(t);
  }

  @computed
  get teamName() {
    return this.siteTeam?.name ?? 'KCSARA';
  }

  @computed
  get siteName() {
    return `${this.teamName} Check-In`;
  }

  @computed
  get missions() {
    return this.events
      .filter(f => f.isMission)
      .map(this.mapUnitResponder)
      .sort(Store.sortEvents);
  }

  @computed
  get otherEvents() {
    return this.events
      .filter(f => !f.isMission)
      .map(this.mapUnitResponder)
      .sort(Store.sortEvents);
  }

  mapUnitResponder(e: EventViewModel) :EventViewModel {
    return ({ ...e, myUnitResponding: e.units.filter(u => u.name === this.siteTeam?.name).length > 0 });
  }

  static sortEvents(a :EventViewModel, b :EventViewModel) :number {
    if (a.startAt < b.startAt) return 1;
    if (b.startAt < a.startAt) return -1;
    return 0;
  }
}

export default Store;
