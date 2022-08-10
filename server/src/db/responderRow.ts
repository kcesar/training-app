import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbBuilder";
import { EventRow } from "./eventRow";
import { EventUnitRow } from "./eventUnitRow";

export class ResponderRow extends Model {
  declare id: number;
  declare memberId: string;
  declare name: string;
  declare email: string;
  declare planned: boolean;
  declare eventId: number;
  declare unitId: number;
  declare timeIn: string;
  declare timeOut?: string;
  declare miles?: number;

  declare getEvent: () => Promise<EventRow>;
  declare setEvent: (event: EventRow) => Promise<void>;
  declare getUnit: () => Promise<EventUnitRow>;
  declare setUnit: (event: EventUnitRow) => Promise<void>;
  declare createdAt: string;
  declare updatedAt: string;
}

ResponderRow.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  memberId: { type: DataTypes.STRING, allowNull: true },
  eta: { type: DataTypes.DATE},
  responding: { type: DataTypes.DATE },
  timeOut: { type: DataTypes.DATE },
  miles: { type: DataTypes.INTEGER },
}, { sequelize });

EventRow.hasMany(ResponderRow, {
  as: 'responders',
  foreignKey: 'eventId',
  onDelete: 'CASCADE'
});
ResponderRow.belongsTo(EventRow, { as: 'event', foreignKey: 'eventId' });

EventUnitRow.hasMany(ResponderRow, {
  as: 'responders',
  foreignKey: 'unitId',
  onDelete: 'CASCADE'
})
ResponderRow.belongsTo(EventUnitRow, { as: 'unit', foreignKey: 'unitId'})