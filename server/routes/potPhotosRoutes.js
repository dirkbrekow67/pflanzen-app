import express from "express";
import db from "../database/db.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.post("/", upload.single("image"), (req, res) => {
  const { potId, photoType } = req.body;

  if (!req.file || !potId) {
    return res.status(400).json({ error: "Fehlende Daten" });
  }

  const fileName = req.file.filename;
  const originalName = req.file.originalname;

  const stmt = db.prepare(`
    INSERT INTO pot_photos (potId, fileName, originalName, photoType)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(potId, fileName, originalName, photoType || "progress");

  res.json({
    success: true,
    fileName,
  });
});

router.get("/:potId", (req, res) => {
  try {
    const { potId } = req.params;

    const photos = db
      .prepare(
        `
        SELECT *
        FROM pot_photos
        WHERE potId = ?
        ORDER BY uploadedAt DESC
      `,
      )
      .all(potId);

    res.json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Fotos konnten nicht geladen werden",
    });
  }
});

export default router;
