import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbBuilder";
import { SignupRow } from "./signupRow";

export class OfferingRow extends Model {
  declare id: number;
  declare courseId: string;
  declare startAt: string;
  declare doneAt: string;
  declare capacity: number;
  declare location: string;
  declare getSignups: () => Promise<SignupRow[]>;

  declare createdAt: string;
  declare updatedAt: string;
}

OfferingRow.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  courseId: { type: DataTypes.STRING, allowNull: false },
  startAt: { type: DataTypes.DATE, allowNull: false },
  doneAt: { type: DataTypes.DATE, allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 35 },
  location: { type: DataTypes.STRING, allowNull: false, defaultValue: 'TBD' },
}, { sequelize });

OfferingRow.hasMany(SignupRow, {
  as: 'signups',
  foreignKey: 'offeringId',
  onDelete: 'CASCADE'
});
SignupRow.belongsTo(OfferingRow, { as: 'offering', foreignKey: 'offeringId' });
