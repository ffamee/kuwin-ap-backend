import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config({ path: '.env' });
export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  synchronize: process.env.SYNCHRONIZE === 'true',
};
