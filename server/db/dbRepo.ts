import { Sequelize } from 'sequelize';
import { CompletionRow } from './completionRow';
import { OfferingRow } from './offeringRow';
import { SignupRow } from './signupRow';

type OfferingWithSignedUp = OfferingRow & { signedUp: number};
type SignupWithOffering = SignupRow & { offering: OfferingRow };

export default class DBRepo {
  async getCompleted(traineeEmail: string) {
    const rows = await CompletionRow.findAll({ where: { traineeEmail }});
    return rows;
  }

  async getOfferings() {
    // Sequelize doesn't make this obvious... hacky hacky

    let rows = JSON.parse(JSON.stringify(await OfferingRow.findAll())) as OfferingWithSignedUp[];
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
    console.log('ROWS', rows);
    return rows as SignupWithOffering[];
  }
}