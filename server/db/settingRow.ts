import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbBuilder";

// Named JSON blobs for app configuration that admins can edit.
export class SettingRow extends Model {
  declare id: string;
  declare value: string;
  declare createdAt: string;
  declare updatedAt: string;
}

SettingRow.init({
  id: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.TEXT, allowNull: false },
}, { sequelize });
