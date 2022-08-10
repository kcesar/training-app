import { Express } from 'express';
import ResponderModel from '../../../api-models/responderModel';
import DBRepo from '../db/dbRepo';
import { ResponderRow } from '../db/responderRow';

function responderRowToModel(responderRow: ResponderRow) {
  const { createdAt, updatedAt, ...api } = responderRow;
  return api;
}

export function addAccountApi(app: Express, db: DBRepo) {
  app.get('/api/v1/responses', async (req, res) => {
    if (!req.session.auth) {
      res.status(401).json({ error: 'authentication required' });
      return;
    }

    const data: ResponderModel[] = await Promise.all((await db.getResponsesForMember(req.session.auth.email)).map(responderRowToModel));
    res.json({data});
  })
}