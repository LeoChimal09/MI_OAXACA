import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

declare global {
  var __mioaxacaMysqlPool: mysql.Pool | undefined;
}

function getConnectionString() {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error("DATABASE_URL is required to use the Mi Oaxaca database.");
  }
  return value;
}

function getPool() {
  if (!globalThis.__mioaxacaMysqlPool) {
    globalThis.__mioaxacaMysqlPool = mysql.createPool({
      uri: getConnectionString(),
      connectionLimit: 10,
    });
  }
  return globalThis.__mioaxacaMysqlPool;
}

export const db = drizzle(getPool());
