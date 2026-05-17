/* global process */

import express from "express";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import db from "../database/db.js";
import { createSeedPhotoPreview } from "../services/seedPhotoPreviewService.js";

const execFileAsync = promisify(execFile);
const router = express.Router();

const uploadDir = "server/uploads";

router.get("/health", (req, res) => {
  res.json({
    scannerEnabled: process.env.ENABLE_SCANNER === "true",
    saneDevice: process.env.SANE_DEVICE || null,
  });
});

router.post("/seed-profile/:seedProfileId/scan", async (req, res) => {
  try {
    if (process.env.ENABLE_SCANNER !== "true") {
      return res.status(400).json({ error: "Scanner ist nicht aktiviert." });
    }

    const { seedProfileId } = req.params;
    const { photoType } = req.body;

    if (!seedProfileId) {
      return res.status(400).json({ error: "Samenprofil-ID fehlt." });
    }

    if (!["pack_front", "pack_back"].includes(photoType)) {
      return res.status(400).json({ error: "Ungültige Packungsseite." });
    }

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const seedProfileUploadDir = path.join(uploadDir, "seed-profiles");

    if (!fs.existsSync(seedProfileUploadDir)) {
      fs.mkdirSync(seedProfileUploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const scanBaseName = `scan-${seedProfileId}-${photoType}-${timestamp}.png`;
    const fileName = `seed-profiles/${scanBaseName}`;
    const filePath = path.join(uploadDir, fileName);

    const saneDevice = process.env.SANE_DEVICE;
    const resolution = process.env.SCAN_RESOLUTION || "300";

    const args = [
      "--device-name",
      saneDevice,
      "--resolution",
      resolution,
      "--mode",
      "Color",
      "--source",
      "Flatbed",
      "--format=png",
      "--output-file",
      filePath,
    ];

    await execFileAsync("scanimage", args);

    let previewFileName = "";

    try {
      previewFileName = await createSeedPhotoPreview(fileName);
    } catch (previewError) {
      console.error("Preview-Erzeugung für Scan fehlgeschlagen:", previewError);
    }

    const result = db
      .prepare(
        `
        INSERT INTO seed_profile_photos (
          seedProfileId,
          fileName,
          originalName,
          photoType,
          ocrStatus,
          previewFileName
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      )
      .run(
        seedProfileId,
        fileName,
        `Scan ${photoType}`,
        photoType,
        "pending",
        previewFileName,
      );

    res.json({
      success: true,
      message: "Scan wurde gespeichert.",
      photoId: result.lastInsertRowid,
      fileName,
      previewFileName,
    });
  } catch (error) {
    console.error("Scanner Fehler:", error);

    res.status(500).json({
      error: "Scan konnte nicht durchgeführt werden.",
    });
  }
});

export default router;
