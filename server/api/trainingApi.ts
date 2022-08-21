import { Express } from 'express';
import DBRepo from '../db/dbRepo';
import { OfferingModel} from '../../src/api-models/offeringModel';
import { ProgressModel} from '../../src/api-models/progressModel';

export function addTrainingApi(app: Express, db: DBRepo) {
  app.get('/api/progress/:email', async (req, res) => {
    const email = req.params.email;

    if (!req.session.auth) {
      res.status(401).json({ error: 'authentication required' });
      return;
    }
    if (req.session.auth.isTrainee && req.session.auth.email !== email) {
      res.status(403).json({ error: 'permission denied' });
    }

    let progress :{ [courseId: string]: ProgressModel } = {};

    progress = (await db.getCompleted(email)).reduce((accum, cur) => ({
      ...accum,
      [cur.courseId]: {
        ...accum[cur.courseId],
        completed: cur.completed
      }
    }), progress);
    res.json(progress);
  });

  app.get('/api/offerings', async (req, res) => {
    try {
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
    } catch (err) {
      res.status(500).json({
        message: err + ''
      });
    }
  })
}