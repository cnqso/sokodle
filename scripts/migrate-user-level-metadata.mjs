import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";
import nextEnv from "@next/env";

// Use Next's dotenv parser, including quote/escape handling. Never log credentials.
nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  throw new Error("Configure DB_HOST, DB_USER, DB_PWSS, and DB_NAME before running this migration.");
}
const ratings = JSON.parse(await readFile(new URL("./user-level-ratings.json", import.meta.url), "utf8"));
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWSS,
  database: process.env.DB_NAME,
});
try {
  const [columns] = await db.query("SHOW COLUMNS FROM user_submitted_levels");
  const names = new Set(columns.map(column => column.Field));
  if (!names.has("creator_name")) {
    await db.query("ALTER TABLE user_submitted_levels ADD COLUMN creator_name VARCHAR(32) NULL");
  }
  if (!names.has("difficulty")) {
    // NULL marks unrated rows until the reviewed ratings have been applied.
    await db.query("ALTER TABLE user_submitted_levels ADD COLUMN difficulty TINYINT UNSIGNED NULL DEFAULT NULL");
  }
  // Retain historical country data, while permitting new submissions to omit it.
  const country = columns.find(column => column.Field === "country");
  if (country?.Null === "NO" && country.Default === null) {
    await db.query("ALTER TABLE user_submitted_levels ALTER COLUMN country SET DEFAULT ''");
  }

  await db.beginTransaction();
  try {
    const [rows] = await db.query("SELECT user_level_id, user_name, layout, creator_name, difficulty FROM user_submitted_levels FOR UPDATE");
    for (const row of rows) {
      const layout = typeof row.layout === "string" ? JSON.parse(row.layout) : row.layout;
      const reviewed = ratings.find(level => level.id === row.user_level_id && level.name === row.user_name &&
        JSON.stringify(level.layout) === JSON.stringify(layout));
      if (row.difficulty === null && !reviewed) {
        throw new Error(`Level ${row.user_level_id} has no matching review. Rate it before rerunning the migration.`);
      }
      if (!reviewed) continue;
      // Preserve ratings/credits already set by creators or an earlier migration run.
      await db.execute(
        `UPDATE user_submitted_levels SET difficulty = COALESCE(difficulty, ?),
         creator_name = COALESCE(NULLIF(creator_name, ''), ?) WHERE user_level_id = ?`,
        [reviewed.difficulty, reviewed.creator_name, row.user_level_id],
      );
    }
    await db.commit();
  } catch (error) {
    await db.rollback();
    throw error;
  }
  await db.query("ALTER TABLE user_submitted_levels MODIFY COLUMN difficulty TINYINT UNSIGNED NOT NULL DEFAULT 2");
  const [constraints] = await db.execute(
    `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_submitted_levels' AND CONSTRAINT_NAME = 'user_level_difficulty_range'`,
  );
  if (!constraints.length) {
    await db.query("ALTER TABLE user_submitted_levels ADD CONSTRAINT user_level_difficulty_range CHECK (difficulty BETWEEN 1 AND 3)");
  }
  const [verified] = await db.query("SELECT user_level_id, user_name, creator_name, difficulty FROM user_submitted_levels ORDER BY user_level_id");
  console.table(verified);
} finally {
  await db.end();
}
