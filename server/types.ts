import { AuthData } from "./server";

declare module 'express-session' {
  export interface SessionData {
    auth: AuthData
  }
}