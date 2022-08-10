import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbBuilder";
import { EventUnitRow } from "./eventUnitRow";
import { ResponderRow } from "./responderRow";

export class EventRow extends Model {
  declare id: number;
  declare name: string;
  declare number: string;
  declare startAt: string;
  declare isMission: boolean;
  declare addEventUnitRow: (row: EventUnitRow) => void;
  declare getResponders: () => Promise<ResponderRow[]>;
  declare getUnits: () => Promise<EventUnitRow[]>;
  declare createdAt: string;
  declare updatedAt: string;
}

EventRow.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  number: { type: DataTypes.STRING },
  startAt: { type: DataTypes.DATE, allowNull: false },
  isMission: { type: DataTypes.BOOLEAN, allowNull: false},
}, { sequelize });