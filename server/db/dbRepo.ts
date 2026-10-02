import { Op, Sequelize, Transaction } from 'sequelize';
import { CourseModel } from '../../src/api-models/courseModel';
import { defaultCourses } from '../defaultCourses';
import { CompletionRow } from './completionRow';
import { OfferingRow } from './offeringRow';
import { SettingRow } from './settingRow';
import { SignupRow } from './signupRow';
import { utcDate } from './dates';

type OfferingWithSignedUp = OfferingRow & { signedUp: number, waiting: number };
type SignupWithOffering = SignupRow & { offering: OfferingRow };

const COURSES_SETTING = 'courses';

export default class DBRepo {

  async getCourses(): Promise<CourseModel[]> {
    const row = await SettingRow.findByPk(COURSES_SETTING);
    return row ? JSON.parse(row.value) : defaultCourses;
  }

  async saveCourses(courses: CourseModel[]) {
    await SettingRow.upsert({ id: COURSES_SETTING, value: JSON.stringify(courses) });
  }

  async getCompleted(traineeEmail: string) {
    const rows = await CompletionRow.findAll({ where: { traineeEmail }});
    return rows;
  }

  async getCompletedForOffering(offeringId: string) {
    const offering = await OfferingRow.findOne({ where: { id: offeringId }});
    if (!offering) return [];
    const rows = await CompletionRow.findAll({ where: { courseId: offering.courseId, completed: utcDate(offering.doneAt) }});
    return rows;
  }

  // Completions are matched to an offering by course and end date, like getCompletedForOffering.
  async getCompletionCountsForCourse(courseId: string) {
    const offerings = await OfferingRow.findAll({ where: { courseId }});
    const completions = await CompletionRow.findAll({ where: { courseId }});
    const counts: { [offeringId: string]: number } = {};
    for (const o of offerings) {
      const doneAt = utcDate(o.doneAt).getTime();
      counts[o.id + ''] = completions.filter(c => utcDate(c.completed).getTime() === doneAt).length;
    }
    return counts;
  }

  async getOfferings() {
    // Sequelize doesn't make this obvious... hacky hacky

    let rows = JSON.parse(JSON.stringify(await OfferingRow.findAll({
      order: [ 'startAt' ],
    }))) as OfferingWithSignedUp[];
    const lookup :{[id:string]: OfferingWithSignedUp } = {};
    rows.forEach(r => lookup[r.id] = r);

    const counts = await SignupRow.findAll({
      attributes: [
        'offeringId',
        'onWaitList',
        [Sequelize.fn('COUNT', '1'), 'signups']
      ],
      group: ['offeringId', 'onWaitList']
    });

    rows.forEach(r => { r.signedUp = 0; r.waiting = 0; });
    counts.forEach(c => {
      const row = lookup[c.offeringId];
      if (!row) return;
      const count = Number(c.getDataValue('signups'));
      if (c.onWaitList) row.waiting = count; else row.signedUp = count;
    });

    return rows;
  }

  // Ordered by sign-up, which is also wait list order.
  async getSignupsForOffering(id: string, transaction?: Transaction) {
    const rows = await SignupRow.findAll({ where: { offeringId: id }, order: [['id', 'ASC']], transaction });
    return rows;
  }

  async getWaitlistPosition(signup: SignupRow) {
    return SignupRow.count({ where: { offeringId: signup.offeringId, onWaitList: true, id: { [Op.lte]: signup.id } } });
  }

  // Moves the first `count` people on the wait list into the class. Returns their emails.
  async promoteFromWaitlist(offeringId: number, count: number, transaction: Transaction) {
    if (count <= 0) return [];
    const waiting = (await this.getSignupsForOffering(offeringId + '', transaction)).filter(s => s.onWaitList).slice(0, count);
    for (const s of waiting) await s.update({ onWaitList: false }, { transaction });
    return waiting.map(s => s.traineeEmail);
  }

  async getSignupsForTrainee(email: string) {
    const rows = await SignupRow.findAll({
      where: { traineeEmail: email },
      include: [{ model: OfferingRow, as: 'offering' }],
     });
    return rows as SignupWithOffering[];
  }

  async getSignupsForCourse(courseId: string) {
    const rows = await SignupRow.findAll({
      where: { '$offering.courseId$': courseId },
      include: [{ model: OfferingRow, as: 'offering' }],
    })
    return rows;
  }
}