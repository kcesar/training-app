import { HostUnitRow } from './hostUnitRow';
import { EventRow } from './eventRow';
import { EventUnitRow } from './eventUnitRow';
import { ResponderRow } from './responderRow';
export default class DBRepo {
  async getHost(host: string) {
    try {
      return await HostUnitRow.findOne({ where: { siteDomain: host} })
    } catch (ex) {
      console.log('ERROR', ex);
    }
    return undefined;
  }

  async getEvents() {
    const rows = await EventRow.findAll({include: [{ model: EventUnitRow, as: 'units' }, { model: ResponderRow, as: 'responders' }]});
    return rows;
  }

  async getEventDetail(eventId: number) {
    return await EventRow.findByPk(eventId, {include: [{ model: EventUnitRow, as: 'units' }, { model: ResponderRow, as: 'responders' }]});
  }

  async getResponsesForMember(memberEmail: string) {
    return await ResponderRow.findAll({where: { email: memberEmail }})
  }
}