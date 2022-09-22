import { Express, Request, Response } from 'express';
import DBRepo from '../db/dbRepo';
import { OfferingModel} from '../../src/api-models/offeringModel';
import { ProgressModel} from '../../src/api-models/progressModel';
import { SignupModel } from '../../src/api-models/signupModel';
import { SignupRow } from '../db/signupRow';
import { Logger } from 'winston';
import WorkspaceClient from '../googleWorkspace';

export function addAdminApi(app: Express, db: DBRepo, workspaceClient: WorkspaceClient, log: Logger) {
  async function withErrors(res: Response, action: () => Promise<void>) {
    try {
      await action();
    } catch (err) {
      log.error(err);
      res.status(500).json({ message: err });
    }
  }

  function isAdmin(req: Request, res: Response) {
    if (!req.session.auth) {
      res.status(401).json({ error: 'authentication required' });
      return false;
    }
    if (req.session.auth.isTrainee) {
      res.status(403).json({ error: 'permission denied' });
      return false;
    }
    return true;
  }

  app.get('/api/admin/trainees', async (req, res) => {
    if (!isAdmin(req, res)) return;

    const rows = workspaceClient.getTrainees();
    res.json(rows);
  });

  app.get('/api/admin/courses/:courseId/signups', async (req, res) => {
    if (!isAdmin(req, res)) return;

    const dbRows = await db.getSignupsForCourse(req.params.courseId);
    const rows :SignupModel[] = dbRows.map(r => ({
      id: r.id + '',
      offeringId: r.offeringId + '',
      traineeEmail: r.traineeEmail,
      traineeName: workspaceClient.getUserFromEmail(r.traineeEmail)?.name.fullName
    }));

    res.json(rows);
  })
}