import { sequelize } from "./db/dbBuilder";
import "./db/dbRepo";
import { EventRow } from "./db/eventRow";
import { EventUnitRow } from "./db/eventUnitRow";
import { HostUnitRow } from "./db/hostUnitRow";
import { ResponderRow } from "./db/responderRow";

async function run() {
  if (!process.env.DB_HOST) await sequelize.sync({force: true});

  HostUnitRow.create({ name: 'ESAR', siteDomain: 'respond2.kcesar.org', background: '#154515', color: 'white' })
  HostUnitRow.create({ name: 'SMR', siteDomain: 'respond.smr.org', background: '#00234c', color: 'white' })

  const sampleEvent = await EventRow.create({ name: 'Sample Event', startAt: new Date(), isMission: true });
  const esarUnit = await EventUnitRow.create({ name: 'ESAR', byMember: 'sample@kcesar.org', eventId: sampleEvent.id });
  await ResponderRow.create({ email: 'john.doe@sar.local', name: 'John Doe', eventId: sampleEvent.id, unitId: esarUnit.id, timeIn: new Date(), planned: true });
  await ResponderRow.create({ email: 'jane.smith@sar.local', name: 'Jane Smith', eventId: sampleEvent.id, unitId: esarUnit.id, timeIn: new Date(new Date().getTime() - 10000000), timeOut: new Date(), miles: 90, planned: false });

  const sampleTraining = await EventRow.create({ name: 'Sample Training', startAt: new Date(new Date().getTime() + 1000000), isMission: false });

}
run();