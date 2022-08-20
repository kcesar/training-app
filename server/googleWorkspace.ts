import * as fs from 'fs/promises';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';

interface GoogleUser {
  primaryEmail: string,
  orgUnitPath: string,
  isMailboxSetup: boolean,
  name: {
    givenName: string,
    familyName: string,
    fullName: string,
  },
}

class WorkspaceClient {
  cacheUsers: {
    trainees: GoogleUser[],
    lookup: { [email: string]: GoogleUser },
  } = {
    trainees: [],
    lookup: {}
  };
  cacheTime: number = 0;

  async init() {
    let credsFile = "google-credentials.json";
    try {
      await fs.access(credsFile)
    } catch {
      credsFile = `../${credsFile}`;
    }
    
    const credsContent = await fs.readFile(credsFile);
    const creds = JSON.parse(credsContent.toString());
    console.log('creds', creds.toString());
    const jwtClient = new google.auth.JWT(
      creds.client_email,
      undefined,
      creds.private_key,
      [
        'https://www.googleapis.com/auth/admin.directory.user'
      ],
      process.env.GOOGLE_ADMIN_ACCOUNT);

    this.cacheUsers = await this.loadUsers(jwtClient);

    return this;
  }

  getUserFromEmail(email: string) {
    return this.cacheUsers.lookup[email];
  }

  private async loadUsers(jwtClient: JWT) {
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


    return {
      lookup: users.reduce((accum, cur) => ({ ...accum, [cur.primaryEmail]: cur }), {}),
      trainees: users.filter(f => f.orgUnitPath === '/Trainees')
    };
  }
}

export default WorkspaceClient;