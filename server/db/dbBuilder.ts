import { Sequelize } from 'sequelize';
import * as Tedious from 'tedious';
import { createLogger } from '../logging';

const log = createLogger('sequelize');

function build() {
  const commonOptions = {
    logging: (sql: string) => log.debug(sql) 
  };

  let sequelize :Sequelize;
  if (process.env.DB_HOST) {
    if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASS) {
      throw new Error('DB environment not set (DB_NAME, DB_USER, DB_PASS)');
    }
    console.log(`Using MSSQL ${process.env.DB_HOST}`);
    //@ts-ignore
    Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
      return this._applyTimezone(date, options).format('YYYY-MM-DDTHH:mm:ss');
    };
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        ...commonOptions,
        host: process.env.DB_HOST,
        dialect: 'mssql',
        dialectModule: Tedious,
        schema: 'training',
        dialectOptions: {
          encrypt: true,
          database: process.env.DB_NAME,
        },
      }
    );
  } else {
    sequelize = new Sequelize(
      '', '', '',
      {
        ...commonOptions,
        dialect: 'sqlite',
        storage: 'store.sqlite'
      }
    );
  }


  return sequelize;
}


export const sequelize = build();
