import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbBuilder";
import { EventRow } from "./eventRow";

export class EventUnitRow extends Model {
  declare id: number;
  declare name: string;
  declare byMember: string;
  declare createdAt: string;
  declare updatedAt: string;
}

EventUnitRow.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING },
  byMember: { type: DataTypes.STRING },
}, { sequelize });

EventRow.hasMany(EventUnitRow, {
  as: 'units',
  foreignKey: 'eventId',
  onDelete: 'CASCADE'
});
EventUnitRow.belongsTo(EventRow, { as: 'event', foreignKey: 'eventId' });
