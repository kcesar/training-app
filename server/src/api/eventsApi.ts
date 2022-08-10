import { Express } from 'express';
import { EventUnitRow } from '../db/eventUnitRow';
import { EventRow } from '../db/eventRow';
import EventModel from '../../../api-models/eventModel';
import DBRepo from '../db/dbRepo';
import '../types';
import { ResponderRow } from '../db/responderRow';

export function addEventsApi(app: Express, db: DBRepo) {
  async function eventRowToModel(e: EventRow) :Promise<EventModel> {
    const model = ({
      id: e.id,
      name: e.name,
      number: e.number,
      startAt: e.startAt,
      isMission: e.isMission,
      createdAt: e.createdAt,
      units: (await e.getUnits()).map(u => ({
        id: u.id,
        name: u.name,
        byMember: u.byMember,
        createdAt: u.createdAt
      })),
      responders: (await e.getResponders()).map(r => {
        const { createdAt, updatedAt, ...api } = r.toJSON<ResponderRow>();
        return api;
      }),
    });
    return model;
  }

  app.get('/api/v1/events', async (req, res) => {
    if (!req.session.auth) {
      res.status(401).json({ error: 'authentication required' });
      return;
    }

    const data: EventModel[] = await Promise.all((await db.getEvents()).map(eventRowToModel));
    res.json({data});
  });

  app.post('/api/v1/events', async (req, res) => {
    if (!req.session.auth) {
      res.status(401).json({ error: 'authentication required' });
      return;
    }

    let errors: string[] = [];
    let newEvent :EventModel = req.body;
    if (!newEvent.name) errors.push("name is required");
    if (!newEvent.startAt) errors.push("startAt is required");
    if (!newEvent.units || newEvent.units.length == 0) errors.push("units is required");

    if (errors.length) {
      res.status(400);
      res.json({errors});
      return;
    }

    const newRow = await EventRow.create({
      name: newEvent.name,
      number: newEvent.number,
      startAt: newEvent.startAt,
      isMission: newEvent.isMission,
    });

    for (let i=0; i<newEvent.units.length; i++) {
      await EventUnitRow.create({
        eventId: newRow.id,
        name: newEvent.units[i].name,
        byMember: req.session.auth.email,
      });
    }

    res.json(await eventRowToModel(newRow));
  })

  app.get('/api/v1/events/:eventId', async (req, res) => {
    if (!req.session.auth) {
      res.status(401).json({ error: 'authentication required' });
      return;
    }

    const data = await eventRowToModel(await db.getEventDetail(parseInt(req.params.eventId)));
    res.json(data);
  });
}