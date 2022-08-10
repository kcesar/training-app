import { differenceInHours, differenceInMinutes } from "date-fns";
import { autorun, computed, makeObservable, observable, override } from "mobx";
import MobxReactForm from 'mobx-react-form';
import dvr from 'mobx-react-form/lib/validators/DVR';
import validatorjs from 'validatorjs';
import EventViewModel from "../../models/eventViewModel";
import Store from "../../store";
import { DialogStore } from "../../store/dialogStore";
import ResponseStore from "../../store/responseStore";

export class JoinPageStore {
  private store: Store;
 // private responseStore: ResponseStore;

  //@observable event: EventViewModel;
  @observable isImmediate: boolean = true;

  constructor(store: Store/*event: EventViewModel, responseStore: ResponseStore, onFinish?: () => void*/) {
    makeObservable(this);
    this.store = store;
    // this.event = event;
    // this.responseStore = responseStore;
  }

  @computed
  get event() {
    return this.store.events.find(f => f.id + '' === this.store.route.params?.eventId);
  }

  @computed
  get foob() {
    return JSON.parse(JSON.stringify(this.store.route));
  }

  @computed
  get form() {
    const initialEta = this.minutesSinceStart < 0 ? this.event?.startAt : undefined;
    const fields = [
      {
        name: 'nowOrLater',
        label: 'I am heading out',
        value: this.minutesSinceStart > -120 ? 'now' : 'later',
      },
      {
        name: 'date',
        label: 'Date',
        value: initialEta,
      },
      {
        name: 'time',
        label: 'Time',
        value: initialEta,
      }
      // {
      //   name: 'eta',
      //   label: 'ETA to Command',
      //   value: this.minutesSinceStart < 0 ? this.event.startAt : undefined,
      // }
    ];
    const plugins = {
      dvr: dvr(validatorjs)
    };
    const hooks = {
      onSuccess: async (form: MobxReactForm) => {
      }
    };
    return new MobxReactForm({ fields }, { options: {}, plugins, hooks });
  }

  @computed
  get actionText() {
    return 'Respond ' + (this.form.$('nowOrLater').bind().value === 'now' ? 'Now' : 'Later');
  }

  get minutesSinceStart() {
    return 0;
    //return differenceInMinutes(new Date(), this.event.startAt);
  }

//  // @override
//   validate() {
//     //if (this.isImmediate == false && (this.when
//     console.log('join validate');
//   }

 // @override 
  // async _submit() {
  //   console.log('join submit');
  //   await this.responseStore.mainStore.respondToEvent(this.event, this.isImmediate ? undefined : this.when);
  // }

  // @computed get parentStore() { return this.responseStore; }
  // @computed get rootStore() { return this.responseStore.mainStore; }
}
