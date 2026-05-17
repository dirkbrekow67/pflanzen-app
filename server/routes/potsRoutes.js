import express from "express";
import db from "../database/db.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const pots = db.prepare("SELECT * FROM pots ORDER BY id").all();
    res.json(pots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fehler beim Laden der Töpfe" });
  }
});

router.post("/", (req, res) => {
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
      harvestFromMonth,
      harvestToMonth,
      sowingDepthNote,
      rowSpacingCm,
      plantSpacingCm,
      sowingWidthCm,
      sowingNotes,
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
        potNotes,
        harvestFromMonth,
        harvestToMonth,
        sowingDepthNote,
        rowSpacingCm,
        plantSpacingCm,
        sowingWidthCm,
        sowingNotes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      potNotes,
      harvestFromMonth,
      harvestToMonth,
      sowingDepthNote,
      rowSpacingCm,
      plantSpacingCm,
      sowingWidthCm,
      sowingNotes,
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

router.put("/:id", (req, res) => {
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
      harvestFromMonth,
      harvestToMonth,
      sowingDepthNote,
      rowSpacingCm,
      plantSpacingCm,
      sowingWidthCm,
      sowingNotes,
    } = req.body;

    db.prepare(
      `
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
          potNotes = ?,
          harvestFromMonth = ?,
          harvestToMonth = ?,
          sowingDepthNote = ?,
          rowSpacingCm = ?,
          plantSpacingCm = ?,
          sowingWidthCm = ?,
          sowingNotes = ?
      WHERE id = ?
    `,
    ).run(
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
      harvestFromMonth,
      harvestToMonth,
      sowingDepthNote,
      rowSpacingCm,
      plantSpacingCm,
      sowingWidthCm,
      sowingNotes,
      id,
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Aktualisieren fehlgeschlagen",
    });
  }
});

export default router;
