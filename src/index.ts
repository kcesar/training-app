import express from 'express';
import session from 'express-session';
import SequelizeStoreBuilder from 'connect-session-sequelize';

import './types';
import './setup-env';
import path from 'path';

import WorkspaceClient from './googleWorkspace';

import { OAuth2Client, TokenPayload } from 'google-auth-library';
import DBRepo from './db/dbRepo';
import { sequelize } from './db/dbBuilder';

import { existsSync, readFileSync } from 'fs';
import { createLogger } from './logging';
import { addAuthApi } from './api/authApi';
import { addTrainingApi } from './api/trainingApi';

const SequelizeStore = SequelizeStoreBuilder(session.Store);
const expressLog = createLogger('express');

export interface AuthData extends TokenPayload {
  email: string,
  isTrainee: boolean,
}
export function userFromAuth(ticket?: AuthData) {
  if (!ticket) return undefined;
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
  const port = process.env.PORT || 5021; // default port to listen

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
    if (!req.session?.auth && existsSync('local-auth.json')) {
      expressLog.info('using debug login credentials in local-auth.json');
      req.session.auth = JSON.parse(readFileSync('local-auth.json', 'utf8'));
    }

    res.json({
      user: userFromAuth(req.session.auth),
      config: { clientId: process.env.AUTH_CLIENT }
    })
  });

  addAuthApi(app, authClient, workspaceClient);
  addTrainingApi(app, db);

  [
    '/favicon.ico',
    '/logo192.png',
    '/manifest.json',
    '/robots.txt',
    '/service-worker.js',
    '/static'
  ].forEach(p => app.use(p, express.static(path.join(__dirname, `../../client${p}`))));

  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client', 'index.html'));
  });

  // start the Express server
  app.listen(port, () => {
    expressLog.info(`server started at http://localhost:${port}`);
  });
}
boot();