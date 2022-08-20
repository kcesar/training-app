import { sequelize } from "./db/dbBuilder";
import "./db/dbRepo";

async function run() {
  if (!process.env.DB_HOST) await sequelize.sync({force: true});
}
run();