import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbBuilder";

export class OfferingRow extends Model {
  declare id: number;
  declare name: string;
  declare startAt: string;
  declare createdAt: string;
  declare updatedAt: string;
}

OfferingRow.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  startAt: { type: DataTypes.DATE, allowNull: false },
}, { sequelize });