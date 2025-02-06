import mysql from "mysql2/promise";

export async function getDBConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PWSS,
    database: process.env.DB_NAME,
  });
}