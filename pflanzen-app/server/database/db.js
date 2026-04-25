import Database from "better-sqlite3";

const db = new Database("./server/database/pflanzen.db");

db.exec(`
CREATE TABLE IF NOT EXISTS pots (
  id TEXT PRIMARY KEY,
  plantName TEXT,
  status TEXT,
  sowingDate TEXT,
  resowingDate TEXT,
  lifecycle TEXT,
  sowingFromMonth INTEGER,
  sowingToMonth INTEGER,
  germinationTempMin INTEGER,
  germinationTempMax INTEGER,
  germinationDaysMin INTEGER,
  germinationDaysMax INTEGER,
  sowingDepthCm REAL,
  outdoorFromMonth INTEGER,
  outdoorToMonth INTEGER,
  seedProfileId TEXT,
  potNotes TEXT
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS pot_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  potId TEXT,
  plantName TEXT,
  seedProfileId TEXT,
  sowingDate TEXT,
  resowingDate TEXT,
  potNotes TEXT,
  startedAt TEXT,
  endedAt TEXT,
  endReason TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

console.log("SQLite verbunden");

export default db;