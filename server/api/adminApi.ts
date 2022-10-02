import { Express, Request, Response } from 'express';
import DBRepo from '../db/dbRepo';
import { SignupModel } from '../../src/api-models/signupModel';
import { Logger } from 'winston';
import WorkspaceClient from '../googleWorkspace';
import { withErrors } from '../server';
import { CompletionRow } from '../db/completionRow';

export function addAdminApi(app: Express, db: DBRepo, workspaceClient: WorkspaceClient, log: Logger) {
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
    withErrors(res, log, async () => {
      const rows = workspaceClient.getTrainees();
      res.json(rows);
    });
  });

  app.get('/api/admin/reloadUsers', async (req, res) => {
    if (!isAdmin(req, res)) return;

    workspaceClient.forceReload();
    res.json({ message: "OK" });
  });


  app.get('/api/admin/courses/:courseId/signups', async (req, res) => {
    if (!isAdmin(req, res)) return;
    withErrors(res, log, async () => {
      const dbRows = await db.getSignupsForCourse(req.params.courseId);
      const rows :SignupModel[] = dbRows.map(r => {
        const t = workspaceClient.getUserFromEmail(r.traineeEmail);
        return {
          id: r.id + '',
          offeringId: r.offeringId + '',
          traineeEmail: r.traineeEmail,
          traineeName: t?.name?.fullName ?? r.traineeEmail,
          traineePhone: t?.phones?.find(f => f.type === 'mobile')?.value,
        };
      }).sort((a,b) => a.traineeName.localeCompare(b.traineeName));

      res.json(rows);
    });
  })

  app.get('/api/admin/offerings/:offeringId/completed', getCompletedForOffering);

  async function getCompletedForOffering(req: Request, res: Response) {
    if (!isAdmin(req, res))
      return;

    const dbRows = await db.getCompletedForOffering(req.params.offeringId);
    const rows = dbRows.map(r => ({
      id: r.id + '',
      traineeEmail: r.traineeEmail,
      completed: r.completed,
    }));
    res.json(rows);
  }

  app.post('/api/admin/offerings/:offeringId/completed', async (req, res) => {
    if (!isAdmin(req, res)) return;
    withErrors(res, log, async () => {
      const offering = (await db.getOfferings()).find(f => f.id + '' === req.params.offeringId);
      const dbExisting = await db.getCompletedForOffering(req.params.offeringId);
      const incomingList = (req.body as { list: string[] })?.list;

      for (let i=0; i<dbExisting.length; i++) {
        const incomingIdx = incomingList.indexOf(dbExisting[i].traineeEmail);
        if (incomingIdx >= 0) {
          log.info(`Found existing row for ${dbExisting[i].traineeEmail}`);
          incomingList.slice(incomingIdx, 1);
        } else {
          log.info(`Removing completed entry for ${dbExisting[i].traineeEmail}`);
          await dbExisting[i].destroy();
        }
      }

      log.info("New entries: ", incomingList);
      for (let i=0; i<incomingList.length; i++) {
        CompletionRow.create({
          traineeEmail: incomingList[i],
          courseId: offering?.courseId,
          completed: offering?.doneAt
        });
      }

      getCompletedForOffering(req, res);
    })
  })
}