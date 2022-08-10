import { LoginResult } from '../../../api-models/loginModel';

export type UserViewModel = LoginResult;
export default UserViewModel;

export function loginToViewModel(api: LoginResult) :UserViewModel {
  return api;
}