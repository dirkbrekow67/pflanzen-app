import express from "express";
import db from "../database/db.js";

const router = express.Router();

router.post("/", (req, res) => {
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
      endReasonNote,
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

router.get("/:potId", (req, res) => {
  try {
    const { potId } = req.params;

    const rows = db
      .prepare(
        `
      SELECT *
      FROM pot_history
      WHERE potId = ?
      ORDER BY id DESC
    `,
      )
      .all(potId);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Historie konnte nicht geladen werden",
    });
  }
});

export default router;
