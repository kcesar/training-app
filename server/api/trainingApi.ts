import { Express, Request, Response } from 'express';
import { isPast } from 'date-fns';
import DBRepo from '../db/dbRepo';
import { OfferingModel} from '../../src/api-models/offeringModel';
import { ProgressModel} from '../../src/api-models/progressModel';
import { SignupRow } from '../db/signupRow';
import { Logger } from 'winston';
import { withErrors } from '../server';
import { utcDate } from '../db/dates';

export function addTrainingApi(app: Express, db: DBRepo, log: Logger) {
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

    for (const signup of await db.getSignupsForTrainee(email)) {
      const courseId = signup.offering.courseId;
      const course = progress[courseId] ?? ({ courseId, status: 'waiting', registrations: {} } as unknown as ProgressModel);
      const isPastOffering = isPast(utcDate(signup.offering.startAt));
      course.registrations[signup.offeringId] = signup.onWaitList
        ? { status: 'waiting', isPast: isPastOffering, waitlistPosition: await db.getWaitlistPosition(signup) }
        : { status: 'registered', isPast: isPastOffering };
      if (!signup.onWaitList) course.status = 'registered';
      progress[courseId] = course;
    }

    progress = (await db.getCompleted(email)).reduce((accum, cur) => ({
      ...accum,
      [cur.courseId]: {
        ...accum[cur.courseId],
        status: 'complete',
        completed: utcDate(cur.completed).toISOString()
      }
    }), progress);

    res.json(progress);
  });

  app.get('/api/courses', async (req, res) => {
    withErrors(res, log, async () => {
      res.json(await db.getCourses());
    });
  });

  app.get('/api/offerings', async (req, res) => {
    withErrors(res, log, async () => {
      let offerings :{ [courseId: string]: OfferingModel[] } = {};
      offerings = (await db.getOfferings()).reduce((accum, cur) => {
        return ({
        ...accum,
        [cur.courseId]: [
          ...accum[cur.courseId] ?? [],
          {
            id: cur.id + '',
            courseId: cur.courseId,
            capacity: cur.capacity,
            location: cur.location,
            startAt: utcDate(cur.startAt).toISOString(),
            doneAt: utcDate(cur.doneAt).toISOString(),
            signedUp: cur.signedUp,
            waiting: cur.waiting,
          }
        ]
      })
    }, offerings);
      res.json(offerings);
    });
  });

  app.post('/api/offerings/:id/register', async (req, res) => {
    withErrors(res, log, async () => {
      const body = req.body;
      const isAdmin: boolean = !!req.session.auth && !req.session.auth.isTrainee;

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

        // A spot is only open to new trainees when nobody is already waiting for one.
        const registered = existing.filter(s => !s.onWaitList).length;
        const waiting = existing.length - registered;
        const hasOpenSpot = registered < offering.capacity && waiting === 0;

        let onWaitList: boolean;
        if (hasOpenSpot || (isAdmin && body.action === 'register')) {
          onWaitList = false;
        } else if (body.action === 'waitlist') {
          onWaitList = true;
        } else {
          res.status(400).json({message: waiting > 0 ? 'This session has a wait list. Join the wait list instead.' : 'Course is full. Join the wait list instead.'});
          return;
        }
        const row = await SignupRow.create({ offeringId: offering.id, traineeEmail: body.traineeEmail, onWaitList });
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