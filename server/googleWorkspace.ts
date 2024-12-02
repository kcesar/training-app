import * as fs from 'fs/promises';
import { google } from 'googleapis';
import UserModel from '../src/api-models/userModel';

interface GoogleUser extends UserModel {
  orgUnitPath: string,
  isMailboxSetup: boolean,
}

const REFRESH_MILLIS = 1000 * 60 * 5;

class WorkspaceClient {
  cacheUsers: {
    trainees: GoogleUser[],
    lookup: { [email: string]: GoogleUser },
  } = {
    trainees: [],
    lookup: {}
  };
  cacheTime: number = 0;
  loading: boolean = false;

  async init() {
    await this.loadUsers();

    return this;
  }

  forceReload() {
    this.cacheTime = 0;
    this.loading = false;
    this.init();
  }

  getTrainees() :UserModel[] {
    this.init();
    return this.cacheUsers.trainees;
  }

  getUserFromEmail(email: string) {
    this.init();
    return this.cacheUsers.lookup[email];
  }

  private async loadUsers() {
    const isRecent = (new Date().getTime() - REFRESH_MILLIS < this.cacheTime);
    if (this.loading || isRecent) return;
    this.loading = true;

    const jwtClient = await this.getJwtClient();

    const PAGE_SIZE = 500;
    const dir = google.admin('directory_v1');
    let nextPage :string|undefined = undefined;
    let lastLength :number;
    let users: GoogleUser[] = [];

    do {
      const data = (await dir.users.list({
        customer: process.env.GOOGLE_CUSTOMER,
        auth: jwtClient,
        maxResults: PAGE_SIZE,
        pageToken: nextPage
      })).data;

      lastLength = data.users.length;
      nextPage = data.nextPageToken;
      users = users.concat(data.users as GoogleUser[]);
      console.log(`Loaded ${lastLength} users`)
    } while (lastLength >= PAGE_SIZE);

    this.cacheTime = new Date().getTime();
    this.cacheUsers = {
      lookup: users.reduce((accum, cur) => ({ ...accum, [cur.primaryEmail]: cur }), {}),
      trainees: users.filter(f => f.orgUnitPath === '/Trainees')
    };
    this.loading = false;
  }

  private async getJwtClient() {
    let creds: any;
    if (process.env.GOOGLE_CREDENTIALS) {
      console.log('Reading creds from the environment');
      creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } else {
      let credsFile = "google-credentials.json";
      try {
        await fs.access(credsFile)
      } catch {
        credsFile = `../${credsFile}`;
      }

      const credsContent = await fs.readFile(credsFile);
      creds = JSON.parse(credsContent.toString());
    }
    const jwtClient = new google.auth.JWT(
      creds.client_email,
      undefined,
      creds.private_key,
      [
        'https://www.googleapis.com/auth/admin.directory.user'
      ],
      process.env.GOOGLE_ADMIN_ACCOUNT);
    return jwtClient;
  }
}

export default WorkspaceClient;