import Database from "better-sqlite3";

const db = new Database("./server/database/pflanzen.db");

db.exec(`
CREATE TABLE IF NOT EXISTS pots (
  id TEXT PRIMARY KEY,
  plantName TEXT,
  status TEXT,
  sowingDate TEXT
);
`);

console.log("SQLite verbunden");

export default db;