import { Sequelize } from 'sequelize';
import { CourseModel } from '../../src/api-models/courseModel';
import { defaultCourses } from '../defaultCourses';
import { CompletionRow } from './completionRow';
import { OfferingRow } from './offeringRow';
import { SettingRow } from './settingRow';
import { SignupRow } from './signupRow';
import { utcDate } from './dates';

type OfferingWithSignedUp = OfferingRow & { signedUp: number};
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
        [Sequelize.fn('COUNT', '1'), 'signups']
      ],
      group: 'offeringId'
    });

    counts.forEach(c => {
      lookup[c.offeringId].signedUp = c.getDataValue('signups')
    });

    return rows;
  }

  async getSignupsForOffering(id: string) {
    const rows = await SignupRow.findAll({ where: { offeringId: id }});
    return rows;
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