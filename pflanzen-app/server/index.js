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
  endReasonNote,
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
        endReason,
        endReasonNote
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      endReason,
      endReasonNote
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

        const profileResults = db
  .prepare(`
    SELECT 
      h.seedProfileId,
      s.plantName,
      s.variety,
      s.manufacturer,
      h.endReason,
      COUNT(*) AS count
    FROM pot_history h
    LEFT JOIN seed_profiles s ON h.seedProfileId = s.id
    WHERE h.seedProfileId IS NOT NULL AND h.seedProfileId != ''
    GROUP BY 
      h.seedProfileId,
      s.plantName,
      s.variety,
      s.manufacturer,
      h.endReason
    ORDER BY s.plantName, s.variety, s.manufacturer
  `)
  .all();

  const profileSummaryMap = {};

profileResults.forEach((item) => {
  if (!profileSummaryMap[item.seedProfileId]) {
    profileSummaryMap[item.seedProfileId] = {
  seedProfileId: item.seedProfileId,
  plantName: item.plantName || "",
  variety: item.variety || "",
  manufacturer: item.manufacturer || "",
  total: 0,
  successful: 0,
  failed: 0,
  other: 0,
};
  }

  profileSummaryMap[item.seedProfileId].total += item.count;

  if (item.endReason === "geerntet") {
    profileSummaryMap[item.seedProfileId].successful += item.count;
  } else if (item.endReason === "fehlgeschlagen") {
    profileSummaryMap[item.seedProfileId].failed += item.count;
  } else {
    profileSummaryMap[item.seedProfileId].other += item.count;
  }
});

const profileSummary = Object.values(profileSummaryMap).map((item) => ({
  ...item,
  successRate:
    item.total > 0 ? Math.round((item.successful / item.total) * 100) : 0,
}));

const topProfiles = [...profileSummary]
  .filter((item) => item.total >= 2)
  .sort((a, b) => {
    if (b.successRate !== a.successRate) {
      return b.successRate - a.successRate;
    }

    return b.total - a.total;
  })
  .slice(0, 5);


    res.json({
      activePots: activePots.count,
      emptyPots: emptyPots.count,
      historyCount: historyCount.count,
      harvestedCount: harvestedCount.count,
      failedCount: failedCount.count,
      averageDuration,
      profileResults,
      profileSummary,
      topProfiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Statistik konnte nicht geladen werden",
    });
  }
});

app.get("/api/reminders", (req, res) => {
  try {
    const pots = db.prepare("SELECT * FROM pots WHERE status != 'empty'").all();
    const today = new Date();

    const reminders = [];

    pots.forEach((pot) => {
      if (!pot.sowingDate) return;

      const sowingDate = new Date(pot.sowingDate);
      const daysSinceSowing =
        Math.round((today - sowingDate) / (1000 * 60 * 60 * 24)) + 1;

      if (pot.germinationDaysMax && daysSinceSowing > pot.germinationDaysMax) {
        reminders.push({
          potId: pot.id,
          plantName: pot.plantName,
          type: "germination-check",
          message: "Keimdauer überschritten – Topf kontrollieren",
          explanation:
            "Die maximale Keimdauer laut Samenprofil ist überschritten. Prüfe, ob Keimlinge sichtbar sind und ob Feuchtigkeit, Temperatur und Standort passen.",
          daysSinceSowing,
          germinationDaysMax: pot.germinationDaysMax,
        });
      }

      if (daysSinceSowing >= 21) {
        reminders.push({
          potId: pot.id,
          plantName: pot.plantName,
          type: "repot-check",
          message: "Wuchs prüfen – ggf. vereinzeln oder umtopfen",
explanation:
  "Prüfe, ob die Pflanzen im Topf genügend Platz haben. Wenn mehrere Jungpflanzen sehr dicht stehen, können sie vorsichtig vereinzelt oder in größere bzw. eigene Töpfe umgesetzt werden. Bei Kräutern kann ein dichterer Wuchs je nach Art auch gewünscht sein.",
          daysSinceSowing,
        });
      }
    });

    const priorityOrder = {
  "germination-check": 1,
  "repot-check": 2,
};

reminders.sort((a, b) => {
  const priorityA = priorityOrder[a.type] || 99;
  const priorityB = priorityOrder[b.type] || 99;

  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }

  return b.daysSinceSowing - a.daysSinceSowing;
});
res.json(reminders);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erinnerungen konnten nicht geladen werden",
    });
  }
});

app.get("/api/seed-profiles", (req, res) => {
  try {
    const profiles = db
      .prepare("SELECT * FROM seed_profiles ORDER BY plantName, variety")
      .all();

    res.json(profiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Samenprofile konnten nicht geladen werden" });
  }
});

app.post("/api/seed-profiles", (req, res) => {
  try {
    const {
      id,
      plantName,
      variety,
      manufacturer,
      experience,
      profileNotes,
      profileStatus,
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
    } = req.body;

    db.prepare(`
      INSERT INTO seed_profiles (
        id,
        plantName,
        variety,
        manufacturer,
        experience,
        profileNotes,
        profileStatus,
        lifecycle,
        sowingFromMonth,
        sowingToMonth,
        germinationTempMin,
        germinationTempMax,
        germinationDaysMin,
        germinationDaysMax,
        sowingDepthCm,
        outdoorFromMonth,
        outdoorToMonth
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      plantName,
      variety,
      manufacturer,
      experience,
      profileNotes,
      profileStatus,
      lifecycle,
      sowingFromMonth,
      sowingToMonth,
      germinationTempMin,
      germinationTempMax,
      germinationDaysMin,
      germinationDaysMax,
      sowingDepthCm,
      outdoorFromMonth,
      outdoorToMonth
    );

    res.json({ success: true, message: "Samenprofil gespeichert" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Samenprofil konnte nicht gespeichert werden" });
  }
});

app.put("/api/seed-profiles/:id", (req, res) => {
  try {
    const { id } = req.params;

    const {
      plantName,
      variety,
      manufacturer,
      experience,
      profileNotes,
      profileStatus,
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
    } = req.body;

    db.prepare(`
      UPDATE seed_profiles
      SET plantName = ?,
          variety = ?,
          manufacturer = ?,
          experience = ?,
          profileNotes = ?,
          profileStatus = ?,
          lifecycle = ?,
          sowingFromMonth = ?,
          sowingToMonth = ?,
          germinationTempMin = ?,
          germinationTempMax = ?,
          germinationDaysMin = ?,
          germinationDaysMax = ?,
          sowingDepthCm = ?,
          outdoorFromMonth = ?,
          outdoorToMonth = ?
      WHERE id = ?
    `).run(
      plantName,
      variety,
      manufacturer,
      experience,
      profileNotes,
      profileStatus,
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
      id
    );

    res.json({ success: true, message: "Samenprofil aktualisiert" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Samenprofil konnte nicht aktualisiert werden" });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});