import { Express, Request, Response } from 'express';
import DBRepo from '../db/dbRepo';
import { SignupModel } from '../../src/api-models/signupModel';
import { Logger } from 'winston';
import WorkspaceClient from '../googleWorkspace';
import { withErrors } from '../server';
import { CompletionRow } from '../db/completionRow';
import { CourseModel, CourseSettingsModel } from '../../src/api-models/courseModel';
import { OfferingUpdateModel } from '../../src/api-models/offeringModel';
import { OfferingRow } from '../db/offeringRow';
import { SignupRow } from '../db/signupRow';
import { sequelize } from '../db/dbBuilder';
import { utcDate } from '../db/dates';
import { NEW_SEASON_CONFIRMATION, SeasonSummaryModel } from '../../src/api-models/seasonModel';

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
      // Class members by name, then the wait list in sign-up order.
      const rows :SignupModel[] = dbRows.map(r => {
        const t = workspaceClient.getUserFromEmail(r.traineeEmail);
        return {
          id: r.id + '',
          offeringId: r.offeringId + '',
          traineeEmail: r.traineeEmail,
          traineeName: t?.name?.fullName ?? r.traineeEmail,
          traineePhone: t?.phones?.find(f => f.type === 'mobile')?.value,
          onWaitList: !!r.onWaitList,
        };
      }).sort((a,b) => {
        if (a.onWaitList !== b.onWaitList) return a.onWaitList ? 1 : -1;
        return a.onWaitList ? Number(a.id) - Number(b.id) : a.traineeName.localeCompare(b.traineeName);
      });

      res.json(rows);
    });
  })

  app.post('/api/admin/courses/settings', async (req, res) => {
    if (!isAdmin(req, res)) return;
    withErrors(res, log, async () => {
      const courses = await db.getCourses();
      const incoming = req.body as CourseSettingsModel;
      const error = validateSettings(courses, incoming);
      if (error) {
        res.status(400).json({ message: error });
        return;
      }

      const updated = courses.map(c => {
        const s = incoming[c.id];
        if (!s) return c;
        return {
          ...c,
          prereqs: Array.from(new Set(s.prereqs)),
          hours: s.hours,
          startTime: s.startTime || undefined,
          endTime: s.endTime || undefined,
        };
      });
      await db.saveCourses(updated);
      log.info(`${req.session.auth!.email} updated course settings`, incoming);
      res.json(updated);
    });
  });

  app.post('/api/admin/offerings/:offeringId', async (req, res) => {
    if (!isAdmin(req, res)) return;
    withErrors(res, log, async () => {
      const offering = await OfferingRow.findByPk(req.params.offeringId);
      if (!offering) {
        res.status(404).json({ message: `Offering ${req.params.offeringId} not found` });
        return;
      }
      if ((await db.getCompletedForOffering(req.params.offeringId)).length > 0) {
        res.status(409).json({ message: "Can't change an offering after trainees have been marked complete" });
        return;
      }

      const update = parseOfferingUpdate(req.body);
      if ('error' in update) {
        res.status(400).json({ message: update.error });
        return;
      }

      // Any new spots go to the wait list, in order.
      const promoted = await sequelize.transaction(async transaction => {
        await offering.update(update, { transaction });
        const registered = (await db.getSignupsForOffering(offering.id + '', transaction)).filter(s => !s.onWaitList).length;
        return db.promoteFromWaitlist(offering.id, update.capacity - registered, transaction);
      });
      log.info(`${req.session.auth!.email} updated offering ${offering.id}`, { ...req.body, promoted });
      res.json({ message: 'OK', promoted });
    });
  });

  app.post('/api/admin/courses/:courseId/offerings', async (req, res) => {
    if (!isAdmin(req, res)) return;
    withErrors(res, log, async () => {
      const courseId = req.params.courseId;
      if (!(await db.getCourses()).find(c => c.id === courseId)) {
        res.status(404).json({ message: `Course ${courseId} not found` });
        return;
      }

      const update = parseOfferingUpdate(req.body);
      if ('error' in update) {
        res.status(400).json({ message: update.error });
        return;
      }

      const offering = await OfferingRow.create({ courseId, ...update });
      log.info(`${req.session.auth!.email} added offering ${offering.id} for ${courseId}`, req.body);
      res.json({ id: offering.id + '' });
    });
  });

  // Moves a trainee from the wait list into the class. Like an admin registering a trainee, this can
  // put the class over its size (overflow); the size itself isn't changed.
  app.post('/api/admin/signups/:signupId/promote', async (req, res) => {
    if (!isAdmin(req, res)) return;
    withErrors(res, log, async () => {
      const signup = await SignupRow.findByPk(req.params.signupId);
      if (!signup) {
        res.status(404).json({ message: `Signup ${req.params.signupId} not found` });
        return;
      }
      if (!signup.onWaitList) {
        res.status(400).json({ message: `${signup.traineeEmail} is already in the class` });
        return;
      }

      const offering = (await OfferingRow.findByPk(signup.offeringId))!;
      const registered = (await db.getSignupsForOffering(offering.id + '')).filter(s => !s.onWaitList).length;
      await signup.update({ onWaitList: false });
      const overflow = registered >= offering.capacity;
      log.info(`${req.session.auth!.email} moved ${signup.traineeEmail} from the wait list into offering ${signup.offeringId}`, { capacity: offering.capacity, overflow });
      res.json({ message: 'OK', overflow });
    });
  });

  app.delete('/api/admin/offerings/:offeringId', async (req, res) => {
    if (!isAdmin(req, res)) return;
    withErrors(res, log, async () => {
      const offering = await OfferingRow.findByPk(req.params.offeringId);
      if (!offering) {
        res.status(404).json({ message: `Offering ${req.params.offeringId} not found` });
        return;
      }
      // Completions are what count towards later courses' prerequisites, so a session that has them
      // is kept until the season is reset.
      if ((await db.getCompletedForOffering(req.params.offeringId)).length > 0) {
        res.status(409).json({ message: "Can't remove a session after trainees have been marked complete" });
        return;
      }

      // Remove registrations explicitly rather than relying on a cascade in the database schema.
      const dropped = await sequelize.transaction(async transaction => {
        const signups = await SignupRow.findAll({ where: { offeringId: offering.id }, transaction });
        await SignupRow.destroy({ where: { offeringId: offering.id }, transaction });
        await offering.destroy({ transaction });
        return signups.map(s => s.traineeEmail);
      });
      log.info(`${req.session.auth!.email} removed offering ${offering.id} for ${offering.courseId}`, { startAt: offering.startAt, dropped });
      res.json({ message: 'OK' });
    });
  });

  app.get('/api/admin/courses/:courseId/completions', async (req, res) => {
    if (!isAdmin(req, res)) return;
    withErrors(res, log, async () => {
      res.json(await db.getCompletionCountsForCourse(req.params.courseId));
    });
  });

  app.get('/api/admin/season', async (req, res) => {
    if (!isAdmin(req, res)) return;
    withErrors(res, log, async () => {
      const summary: SeasonSummaryModel = {
        sessions: await OfferingRow.count(),
        signups: await SignupRow.count(),
        completions: await CompletionRow.count(),
      };
      res.json(summary);
    });
  });

  // Starts a new training season: removes every session, registration, wait list place and completion.
  // Course settings and prerequisites are kept.
  app.post('/api/admin/season/reset', async (req, res) => {
    if (!isAdmin(req, res)) return;
    withErrors(res, log, async () => {
      if (req.body?.confirm !== NEW_SEASON_CONFIRMATION) {
        res.status(400).json({ message: `Type "${NEW_SEASON_CONFIRMATION}" to confirm` });
        return;
      }
      const removed = await sequelize.transaction(async transaction => ({
        signups: await SignupRow.destroy({ where: {}, transaction }),
        completions: await CompletionRow.destroy({ where: {}, transaction }),
        sessions: await OfferingRow.destroy({ where: {}, transaction }),
      }));
      log.warn(`${req.session.auth!.email} started a new training season`, removed);
      res.json({ message: 'OK', removed });
    });
  });

  app.get('/api/admin/offerings/:offeringId/completed', getCompletedForOffering);

  async function getCompletedForOffering(req: Request, res: Response) {
    if (!isAdmin(req, res))
      return;

    const dbRows = await db.getCompletedForOffering(req.params.offeringId);
    const rows = dbRows.map(r => ({
      id: r.id + '',
      traineeEmail: r.traineeEmail,
      completed: utcDate(r.completed).toISOString(),
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
          incomingList.splice(incomingIdx, 1);
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
          completed: offering && utcDate(offering.doneAt)
        });
      }

      getCompletedForOffering(req, res);
    })
  })
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

// Returns an error message, or undefined if the settings are valid.
function validateSettings(courses: CourseModel[], incoming: CourseSettingsModel): string|undefined {
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return 'Expected a map of course ID to settings';

  const titles = Object.fromEntries(courses.map(c => [c.id, c.title]));
  for (const [courseId, settings] of Object.entries(incoming)) {
    if (!titles[courseId]) return `Unknown course ${courseId}`;
    if (!settings || typeof settings !== 'object') return `Settings for ${titles[courseId]} must be an object`;

    const { prereqs, hours, startTime, endTime } = settings;
    if (typeof hours !== 'number' || !(hours > 0)) return `Hours for ${titles[courseId]} must be more than 0`;
    if (!!startTime !== !!endTime) return `${titles[courseId]} needs both a start and end time, or neither`;
    if (startTime && !TIME_PATTERN.test(startTime)) return `Start time for ${titles[courseId]} must be HH:mm`;
    if (endTime && !TIME_PATTERN.test(endTime)) return `End time for ${titles[courseId]} must be HH:mm`;

    if (!Array.isArray(prereqs)) return `Prerequisites for ${titles[courseId]} must be a list`;
    for (const p of prereqs) {
      if (typeof p !== 'string' || !titles[p]) return `Unknown prerequisite ${p} for ${titles[courseId]}`;
      if (p === courseId) return `${titles[courseId]} can't be its own prerequisite`;
    }
  }

  // Look for cycles in the resulting graph, which would make courses impossible to take.
  const graph = Object.fromEntries(courses.map(c => [c.id, incoming[c.id]?.prereqs ?? c.prereqs ?? []]));
  const state: { [courseId: string]: 'visiting'|'done' } = {};
  const visit = (id: string, path: string[]): string|undefined => {
    if (state[id] === 'done') return undefined;
    if (state[id] === 'visiting') {
      const cycle = [...path.slice(path.indexOf(id)), id];
      return `Prerequisites form a loop: ${cycle.map(c => titles[c]).join(' → ')}`;
    }
    state[id] = 'visiting';
    for (const p of graph[id]) {
      const err = visit(p, [...path, id]);
      if (err) return err;
    }
    state[id] = 'done';
    return undefined;
  };
  for (const id of Object.keys(graph)) {
    const err = visit(id, []);
    if (err) return err;
  }
  return undefined;
}

// Checks the dates and size for a new or changed offering.
function parseOfferingUpdate(body: OfferingUpdateModel): { startAt: Date, doneAt: Date, capacity: number } | { error: string } {
  const startAt = new Date(body?.startAt);
  const doneAt = new Date(body?.doneAt);
  if (isNaN(startAt.getTime()) || isNaN(doneAt.getTime())) return { error: 'Start and end must be valid dates' };
  if (doneAt < startAt) return { error: 'End must be after start' };
  if (!Number.isInteger(body.capacity) || body.capacity < 1) return { error: 'Size must be a whole number of at least 1' };
  return { startAt, doneAt, capacity: body.capacity };
}
