import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  throw new Error("Configure DB_HOST, DB_USER, DB_PWSS, and DB_NAME before running this migration.");
}
const ratings = JSON.parse(await readFile(new URL("../src/lib/levels/daily-ratings.json", import.meta.url), "utf8"));
const db = await mysql.createConnection({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PWSS, database: process.env.DB_NAME,
});
try {
  const [columns] = await db.query("SHOW COLUMNS FROM daily_levels");
  if (!columns.some(column => column.Field === "difficulty")) {
    await db.query("ALTER TABLE daily_levels ADD COLUMN difficulty TINYINT UNSIGNED NULL DEFAULT NULL");
  }
  await db.beginTransaction();
  try {
    const [rows] = await db.query("SELECT daily_id, layout, difficulty FROM daily_levels FOR UPDATE");
    for (const row of rows) {
      if (row.difficulty !== null) continue;
      const layout = typeof row.layout === "string" ? JSON.parse(row.layout) : row.layout;
      const rating = ratings.find(rating => JSON.stringify(rating.layout) === JSON.stringify(layout));
      if (!rating) throw new Error(`Daily level ${row.daily_id} has no matching difficulty review.`);
      await db.execute("UPDATE daily_levels SET difficulty = ? WHERE daily_id = ?", [rating.difficulty, row.daily_id]);
    }
    await db.commit();
  } catch (error) {
    await db.rollback();
    throw error;
  }
  await db.query("ALTER TABLE daily_levels MODIFY COLUMN difficulty TINYINT UNSIGNED NOT NULL DEFAULT 2");
  const [constraints] = await db.execute(
    `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'daily_levels' AND CONSTRAINT_NAME = 'daily_level_difficulty_range'`,
  );
  if (!constraints.length) {
    await db.query("ALTER TABLE daily_levels ADD CONSTRAINT daily_level_difficulty_range CHECK (difficulty BETWEEN 1 AND 3)");
  }
  const [verified] = await db.query("SELECT daily_id, date_of_level, difficulty FROM daily_levels ORDER BY daily_id");
  console.table(verified);
} finally {
  await db.end();
}
