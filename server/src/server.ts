import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import SequelizeStoreBuilder from 'connect-session-sequelize';

import './types';
import { config as configEnv } from 'dotenv';
import path from 'path';

import WorkspaceClient from './googleWorkspace';

import { OAuth2Client, TokenPayload } from 'google-auth-library';
import DBRepo from './db/dbRepo';
import { sequelize } from './db/dbBuilder';
import { addAccountApi } from './api/accountApi';

import EventModel from '../../api-models/eventModel';
import { EventRow } from './db/eventRow';
import { EventUnitRow } from './db/eventUnitRow';
import { existsSync, readFileSync } from 'fs';
import { createLogger } from './logging';
import { addEventsApi } from './api/eventsApi';
import { addAuthApi } from './api/authApi';

configEnv({path: './.env.local'});

const SequelizeStore = SequelizeStoreBuilder(session.Store);
const expressLog = createLogger('express');

export interface AuthData extends TokenPayload {
  email: string,
  isTrainee: boolean,
}
export function userFromAuth(ticket?: AuthData) {
  if (!ticket) return undefined;
console.log('userFromAuth isTrainee', ticket.isTrainee)
  return {
    name: ticket.name,
    email: ticket.email,
    domain: ticket.hd,
    isTrainees: ticket.isTrainee,
    picture: ticket.picture,
  }
}

async function boot() {
  expressLog.debug('Auth ClientID:', { id: process.env.AUTH_CLIENT })
  const authClient = new OAuth2Client(process.env.AUTH_CLIENT);
  const workspaceClient = await new WorkspaceClient().init();

  const app = express();
  const port = 5021; // default port to listen

  //app.use(morgan("combined", { stream: (expressLog.stream as any).write }));

  app.use(express.json());

  app.use(session({
    secret: process.env.SESSION_SECRET || 'psw8e56b9vqpe956qbt',
    resave: true,
    name:'session',
    saveUninitialized:false,
    store: new SequelizeStore({
      db: sequelize,
    }),
  }))

  if (!process.env.DB_HOST) await sequelize.sync();
  const db = new DBRepo();


  app.get('/api/boot', async (req, res) => {
    const siteDomain = ((req.headers['x-forwarded-host'] ?? req.headers['host']) as string).split(':')[0];
    const hostRow = await db.getHost(siteDomain);
    if (!req.session?.auth && existsSync('local-auth.json')) {
      expressLog.info('using debug login credentials in local-auth.json');
      req.session.auth = JSON.parse(readFileSync('local-auth.json', 'utf8'));
    }

    res.json({
      siteTeam: hostRow ? { name: hostRow.name, color: hostRow.color, background: hostRow.background } : undefined,
      user: userFromAuth(req.session.auth),
      config: { clientId: process.env.AUTH_CLIENT }
    })
  });

  addAuthApi(app, authClient, workspaceClient);
  addAccountApi(app, db);
  addEventsApi(app, db);

  ;[
    '/favicon.ico',
    '/logo192.png',
    '/manifest.json',
    '/robots.txt',
    '/service-worker.js',
    '/static'
  ].forEach(p => app.use(p, express.static(path.join(__dirname, `../../frontend/build${p}`))));

  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/build', 'index.html'));
  });

  // start the Express server
  app.listen(port, () => {
    // tslint:disable-next-line:no-console
    expressLog.info(`server started at http://localhost:${port}`);
  });
}
boot();