import { Express, Request, Response } from 'express';
import DBRepo from '../db/dbRepo';
import { OfferingModel} from '../../src/api-models/offeringModel';
import { ProgressModel} from '../../src/api-models/progressModel';
import { SignupRow } from '../db/signupRow';
import { Logger } from 'winston';

export function addTrainingApi(app: Express, db: DBRepo, log: Logger) {
  async function withErrors(res: Response, action: () => Promise<void>) {
    try {
      await action();
    } catch (err) {
      log.error(err);
      res.status(500).json({ message: err });
    }
  }

  function isAdminOrSelf(req: Request, res: Response, email: string) {
    if (!req.session.auth) {
      res.status(401).json({ error: 'authentication required' });
      return false;
    }
    if (req.session.auth.isTrainee && req.session.auth.email !== email) {
      res.status(403).json({ error: 'permission denied' });
      return false;
    }
    return true;
  }

  app.get('/api/progress/:email', async (req, res) => {
    const email = req.params.email;

    if (!isAdminOrSelf(req, res, email)) return;

    let progress :{ [courseId: string]: ProgressModel } = {};

    progress = (await db.getSignupsForTrainee(email)).reduce((accum, cur) => ({
      ...accum,
      [cur.offering.courseId]: {
        ...accum[cur.offering.courseId],
        status: (accum[cur.offering.courseId]?.status === 'registered' || !cur.onWaitList) ? 'registered' : 'waiting',
        registrations: {
          ...accum[cur.offeringId]?.registrations ?? {},
          [cur.offeringId]: 'registered'
        },
      }
    }), progress);

    progress = (await db.getCompleted(email)).reduce((accum, cur) => ({
      ...accum,
      [cur.courseId]: {
        ...accum[cur.courseId],
        status: 'complete',
        completed: cur.completed
      }
    }), progress);

    res.json(progress);
  });

  app.get('/api/offerings', async (req, res) => {
    withErrors(res, async () => {
      let offerings :{ [courseId: string]: OfferingModel[] } = {};
      offerings = (await db.getOfferings()).reduce((accum, cur) => {
        return ({
        ...accum,
        [cur.courseId]: [
          ...accum[cur.courseId] ?? [],
          {
            id: cur.id,
            courseId: cur.courseId,
            capacity: cur.capacity,
            location: cur.location,
            startAt: cur.startAt,
            doneAt: cur.doneAt,
            signedUp: cur.signedUp,
          }
        ]
      })
    }, offerings);
      res.json(offerings);
    });
  });

  app.post('/api/offerings/:id/register', async (req, res) => {
    withErrors(res, async () => {
      const body = req.body;

      if (!isAdminOrSelf(req, res, body.traineeEmail)) return;

      let offering = await (await db.getOfferings()).find(f => f.id + '' === req.params.id);
      if (!offering) {
        res.status(404).json({message: `Offering ${req.params.id} not found`});
        return;
      }


      if (body.action === 'register' || body.action === 'waitlist') {
        let existing = await db.getSignupsForOffering(req.params.id);
        if (existing.find(f => f.traineeEmail === body.traineeEmail)) {
          res.status(400).json({message:'Already registered for this course'});
          return;
        }
        if (existing.length > offering.capacity) {
          res.status(400).json({message:'Course is full'});
          return;
        }
        const row = await SignupRow.create({ offeringId: offering.id, traineeEmail: body.traineeEmail });
        res.json({ result: row });  
      } else if (body.action === 'leave') {
        let existing = await (await db.getSignupsForOffering(req.params.id)).find(f => f.traineeEmail === body.traineeEmail);
        if (!existing) {
          res.status(201);
          return;
        }
        await existing.destroy();
        res.json({ result: existing });
      } else {
        res.status(400).json({message: 'Invalid action ' + body.action });
      }
    });
  });
}