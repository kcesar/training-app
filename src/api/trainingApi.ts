import { Express } from 'express';
import DBRepo from '../db/dbRepo';
import { ProgressModel} from '../../api-models/progressModel';

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
}