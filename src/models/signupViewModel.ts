import { SignupModel } from '../api-models/signupModel';

export default interface SignupViewModel extends SignupModel {

}

export const signupToViewModel = (api: SignupModel) => {
    return ({
    ...api,
    // startAt: parseISO(api.startAt),
    // doneAt: parseISO(api.doneAt),
    // signedUp: api.signedUp ?? 0
  } as SignupViewModel);
}