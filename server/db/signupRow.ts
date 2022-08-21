import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbBuilder";
import { OfferingRow } from "./offeringRow";

export class SignupRow extends Model {
  declare id: number;
  declare traineeEmail: string;
  declare offeringId: number;
  declare onWaitList: boolean;

  declare getOffering: () => Promise<OfferingRow>;
  declare setOffering: (offering: OfferingRow) => Promise<void>;

  declare createdAt: string;
  declare updatedAt: string;
}

SignupRow.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  traineeEmail: { type: DataTypes.STRING, allowNull: false },
  onWaitList: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { sequelize });
