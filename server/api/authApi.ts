import { Express } from 'express';
import { LoginTicket, OAuth2Client } from 'google-auth-library';
import WorkspaceClient from '../googleWorkspace';
import { userFromAuth } from '../server';

export function addAuthApi(app: Express, authClient: OAuth2Client, workspaceClient: WorkspaceClient) {
  app.post("/api/auth/google", async (req, res) => {
    const { token } = req.body;
    if (!process.env.AUTH_CLIENT) {
      res.status(500).json({ error: 'AUTH_CLIENT is not configured' });
      return;
    }

    let ticket: LoginTicket;
    try {
      ticket = await authClient.verifyIdToken({
        idToken: token,
        audience: process.env.AUTH_CLIENT
      });
    } catch (err) {
      // Some verification errors include the token itself, so keep it out of the logs.
      const reason = (err as Error).message.split(token || undefined).join('<token>');
      console.log(`Rejected Google token: ${reason}`);
      res.status(401).json({ error: 'Invalid Google login' });
      return;
    }

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(500).json({message: 'Could not get ticket'});
      return;
    }
    if (!payload.email) {
      res.status(500).json({message: 'Could not get user email'});
      return;
    }

    if ((process.env.ALLOWED_DOMAINS?.split(',')?.indexOf(payload.hd ?? '') ?? 0) < 0) {
      console.log(`${payload.email} from domain ${payload.hd} not allowed`)
      res.status(403).json({error: 'User not from allowed Google domain' })
      return;
    }

    const member = await workspaceClient.getUserFromEmail(payload.email);

    console.log(`got member ${member.orgUnitPath} ${member.orgUnitPath === '/Trainees'}`)
    req.session.auth = {
      email: payload.email,
      isTrainee: member.orgUnitPath === '/Trainees',
      ...payload,
    };
    console.log(`Logged in ${payload.email}`);
    res.status(200);
    res.json(userFromAuth(req.session.auth));
  })

  app.post('/api/auth/logout', (req, res) => {
    req.session?.destroy(err => {
      if (err) {
        res.status(400).json({ error: 'Unable to log out' })
      } else {
        res.json({ msg: 'Logout successful' })
      }
    });
  })
}