import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbBuilder";

export class CompletionRow extends Model {
  declare id: number;
  declare traineeEmail: string;
  declare courseId: string;
  declare completed: string;
  declare createdAt: string;
  declare updatedAt: string;
}

CompletionRow.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  traineeEmail: { type: DataTypes.STRING, allowNull: false },
  courseId: { type: DataTypes.STRING, allowNull: false },
  completed: { type: DataTypes.DATE, allowNull: false },
}, { sequelize });