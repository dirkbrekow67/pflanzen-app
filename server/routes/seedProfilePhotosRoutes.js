import express from "express";
import db from "../database/db.js";
import path from "path";
import fs from "fs";
import { processSeedProfilePhotoOcr } from "../services/ocrService.js";
import upload from "../utils/upload.js";

const router = express.Router();

const uploadDir = "server/uploads";

router.post("/", upload.single("image"), (req, res) => {
  try {
    const { seedProfileId, photoType } = req.body;

    if (!req.file || !seedProfileId) {
      return res.status(400).json({ error: "Fehlende Daten" });
    }
    const fileName = `${req.uploadSubFolder}/${req.file.filename}`;

    db.prepare(
      `
      INSERT INTO seed_profile_photos (
        seedProfileId,
        fileName,
        originalName,
        photoType,
        ocrStatus
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    ).run(
      seedProfileId,
      fileName,
      req.file.originalname,
      photoType || "pack_front",
      "pending",
    );

    res.json({
      success: true,
      fileName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Samenprofil-Foto konnte nicht gespeichert werden",
    });
  }
});

router.get("/", (req, res) => {
  try {
    const photos = db
      .prepare(
        `
        SELECT *
        FROM seed_profile_photos
        ORDER BY uploadedAt DESC
      `,
      )
      .all();

    res.json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Samenprofil-Fotos konnten nicht geladen werden",
    });
  }
});

router.get("/:seedProfileId", (req, res) => {
  try {
    const { seedProfileId } = req.params;

    const photos = db
      .prepare(
        `
        SELECT *
        FROM seed_profile_photos
        WHERE seedProfileId = ?
        ORDER BY uploadedAt DESC
      `,
      )
      .all(seedProfileId);

    res.json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Samenprofil-Fotos konnten nicht geladen werden",
    });
  }
});

router.delete("/:photoId", (req, res) => {
  try {
    const { photoId } = req.params;

    const photo = db
      .prepare("SELECT * FROM seed_profile_photos WHERE id = ?")
      .get(photoId);

    if (!photo) {
      return res.status(404).json({ error: "Foto nicht gefunden" });
    }

    const filePath = path.join(uploadDir, photo.fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (photo.processedFileName) {
      const processedFilePath = path.join(uploadDir, photo.processedFileName);

      if (fs.existsSync(processedFilePath)) {
        fs.unlinkSync(processedFilePath);
      }
    }

    db.prepare("DELETE FROM seed_profile_photos WHERE id = ?").run(photoId);

    res.json({
      success: true,
      message: "Samenprofil-Foto gelöscht",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Samenprofil-Foto konnte nicht gelöscht werden",
    });
  }
});

router.post("/:photoId/ocr", (req, res) => {
  try {
    const { photoId } = req.params;

    const photo = db
      .prepare("SELECT * FROM seed_profile_photos WHERE id = ?")
      .get(photoId);

    if (!photo) {
      return res.status(404).json({ error: "Foto nicht gefunden" });
    }

    db.prepare(
      `
      UPDATE seed_profile_photos
      SET ocrStatus = ?
      WHERE id = ?
    `,
    ).run("processing", photoId);

    setTimeout(() => {
      processSeedProfilePhotoOcr({
        photo,
        photoId,
        uploadDir,
      });
    }, 100);

    res.json({
      success: true,
      message: "OCR-Verarbeitung vorbereitet",
      photoId,
      status: "processing",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "OCR konnte nicht vorbereitet werden",
    });
  }
});

export default router;
