import express from "express";
import cors from "cors";
import db from "./database/db.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server läuft",
  });
});

app.get("/api/pots", (req, res) => {
  try {
    const pots = db.prepare("SELECT * FROM pots ORDER BY id").all();
    res.json(pots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fehler beim Laden der Töpfe" });
  }
});

app.post("/api/pots", (req, res) => {
  try {
    const {
      id,
      plantName,
      status,
      sowingDate,
      resowingDate,
      lifecycle,
      sowingFromMonth,
      sowingToMonth,
      germinationTempMin,
      germinationTempMax,
      germinationDaysMin,
      germinationDaysMax,
      sowingDepthCm,
      outdoorFromMonth,
      outdoorToMonth,
      seedProfileId,
      potNotes,
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO pots (
        id,
        plantName,
        status,
        sowingDate,
        resowingDate,
        lifecycle,
        sowingFromMonth,
        sowingToMonth,
        germinationTempMin,
        germinationTempMax,
        germinationDaysMin,
        germinationDaysMax,
        sowingDepthCm,
        outdoorFromMonth,
        outdoorToMonth,
        seedProfileId,
        potNotes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      plantName,
      status,
      sowingDate,
      resowingDate,
      lifecycle,
      sowingFromMonth,
      sowingToMonth,
      germinationTempMin,
      germinationTempMax,
      germinationDaysMin,
      germinationDaysMax,
      sowingDepthCm,
      outdoorFromMonth,
      outdoorToMonth,
      seedProfileId,
      potNotes
    );

    res.json({
      success: true,
      message: "Topf gespeichert",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Speichern fehlgeschlagen",
    });
  }
});

app.put("/api/pots/:id", (req, res) => {
  try {
    const { id } = req.params;

    const {
      plantName,
      status,
      sowingDate,
      resowingDate,
      lifecycle,
      sowingFromMonth,
      sowingToMonth,
      germinationTempMin,
      germinationTempMax,
      germinationDaysMin,
      germinationDaysMax,
      sowingDepthCm,
      outdoorFromMonth,
      outdoorToMonth,
      seedProfileId,
      potNotes,
    } = req.body;

    db.prepare(`
      UPDATE pots
      SET plantName = ?,
          status = ?,
          sowingDate = ?,
          resowingDate = ?,
          lifecycle = ?,
          sowingFromMonth = ?,
          sowingToMonth = ?,
          germinationTempMin = ?,
          germinationTempMax = ?,
          germinationDaysMin = ?,
          germinationDaysMax = ?,
          sowingDepthCm = ?,
          outdoorFromMonth = ?,
          outdoorToMonth = ?,
          seedProfileId = ?,
          potNotes = ?
      WHERE id = ?
    `).run(
      plantName,
      status,
      sowingDate,
      resowingDate,
      lifecycle,
      sowingFromMonth,
      sowingToMonth,
      germinationTempMin,
      germinationTempMax,
      germinationDaysMin,
      germinationDaysMax,
      sowingDepthCm,
      outdoorFromMonth,
      outdoorToMonth,
      seedProfileId,
      potNotes,
      id
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Aktualisieren fehlgeschlagen",
    });
  }
});

app.post("/api/pot-history", (req, res) => {
  try {
    const {
      potId,
      plantName,
      seedProfileId,
      sowingDate,
      resowingDate,
      potNotes,
      startedAt,
      endedAt,
      endReason,
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO pot_history (
        potId,
        plantName,
        seedProfileId,
        sowingDate,
        resowingDate,
        potNotes,
        startedAt,
        endedAt,
        endReason
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      potId,
      plantName,
      seedProfileId,
      sowingDate,
      resowingDate,
      potNotes,
      startedAt,
      endedAt,
      endReason
    );

    res.json({
      success: true,
      message: "Historie gespeichert",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Historie konnte nicht gespeichert werden",
    });
  }
});

app.get("/api/pot-history/:potId", (req, res) => {
  try {
    const { potId } = req.params;

    const rows = db.prepare(`
      SELECT *
      FROM pot_history
      WHERE potId = ?
      ORDER BY id DESC
    `).all(potId);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Historie konnte nicht geladen werden",
    });
  }
});

app.get("/api/statistics", (req, res) => {
  try {
    const activePots = db
      .prepare("SELECT COUNT(*) AS count FROM pots WHERE status != 'empty'")
      .get();

    const emptyPots = db
      .prepare("SELECT COUNT(*) AS count FROM pots WHERE status = 'empty'")
      .get();

    const historyCount = db
      .prepare("SELECT COUNT(*) AS count FROM pot_history")
      .get();

    const harvestedCount = db
      .prepare(
        "SELECT COUNT(*) AS count FROM pot_history WHERE endReason = 'geerntet'",
      )
      .get();

    const failedCount = db
      .prepare(
        "SELECT COUNT(*) AS count FROM pot_history WHERE endReason = 'fehlgeschlagen'",
      )
      .get();

    const historyRows = db
      .prepare("SELECT startedAt, endedAt FROM pot_history")
      .all();

    const durations = historyRows
      .map((entry) => {
        if (!entry.startedAt || !entry.endedAt) return null;

        const start = new Date(entry.startedAt);
        const end = new Date(entry.endedAt);

        return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      })
      .filter((days) => days !== null);

    const averageDuration =
      durations.length > 0
        ? Math.round(
            durations.reduce((sum, days) => sum + days, 0) / durations.length,
          )
        : 0;

    res.json({
      activePots: activePots.count,
      emptyPots: emptyPots.count,
      historyCount: historyCount.count,
      harvestedCount: harvestedCount.count,
      failedCount: failedCount.count,
      averageDuration,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Statistik konnte nicht geladen werden",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});