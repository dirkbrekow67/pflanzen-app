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

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});