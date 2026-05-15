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
  endReasonNote TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

try {
  db.prepare("ALTER TABLE pot_history ADD COLUMN endReasonNote TEXT").run();
} catch {
  // Spalte existiert bereits
}

db.exec(`
CREATE TABLE IF NOT EXISTS seed_profiles (
  id TEXT PRIMARY KEY,
  plantName TEXT,
  variety TEXT,
  manufacturer TEXT,
  retailer TEXT,
  experience TEXT,
  profileNotes TEXT,
  profileStatus TEXT,
  lifecycle TEXT,
  sowingFromMonth INTEGER,
  sowingToMonth INTEGER,
  germinationTempMin INTEGER,
  germinationTempMax INTEGER,
  germinationDaysMin INTEGER,
  germinationDaysMax INTEGER,
  sowingDepthCm REAL,
  sowingDepthNote TEXT,
  rowSpacingCm REAL,
  plantSpacingCm REAL,
  outdoorFromMonth INTEGER,
  outdoorToMonth INTEGER,
  harvestFromMonth INTEGER,
  harvestToMonth INTEGER
);
`);

try {
  db.prepare("ALTER TABLE seed_profiles ADD COLUMN retailer TEXT").run();
} catch {
  // Spalte existiert bereits
}

try {
  db.prepare(
    "ALTER TABLE seed_profiles ADD COLUMN harvestFromMonth INTEGER",
  ).run();
} catch {
  // Spalte existiert bereits
}

try {
  db.prepare(
    "ALTER TABLE seed_profiles ADD COLUMN harvestToMonth INTEGER",
  ).run();
} catch {
  // Spalte existiert bereits
}

try {
  db.prepare("ALTER TABLE seed_profiles ADD COLUMN sowingDepthNote TEXT").run();
} catch {
  // Spalte existiert bereits
}

try {
  db.prepare("ALTER TABLE seed_profiles ADD COLUMN rowSpacingCm REAL").run();
} catch {
  // Spalte existiert bereits
}

try {
  db.prepare("ALTER TABLE seed_profiles ADD COLUMN plantSpacingCm REAL").run();
} catch {
  // Spalte existiert bereits
}

db.exec(`
CREATE TABLE IF NOT EXISTS pot_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  potId TEXT NOT NULL,
  fileName TEXT NOT NULL,
  originalName TEXT,
  photoType TEXT,
  note TEXT,
  takenAt TEXT,
  uploadedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS seed_profile_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seedProfileId TEXT NOT NULL,
  fileName TEXT NOT NULL,
  processedFileName TEXT,
  originalName TEXT,

  photoType TEXT,
  ocrText TEXT,
  ocrParsed TEXT,
  ocrStatus TEXT DEFAULT 'pending',

  note TEXT,
  takenAt TEXT,
  uploadedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

try {
  db.prepare(
    "ALTER TABLE seed_profile_photos ADD COLUMN processedFileName TEXT",
  ).run();
} catch {
  // Spalte existiert bereits
}

console.log("SQLite verbunden");

export default db;
