import { AuthData } from "./index";

declare module 'express-session' {
  export interface SessionData {
    auth: AuthData
  }
}