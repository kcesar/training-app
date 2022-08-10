export interface LoginError {
  error: string,
}

export interface LoginResult {
  name: string,
  email: string,
  domain: string,
  picture?: string,
  error: undefined,
}

type LoginModel = LoginResult|LoginError;

export default LoginModel;