/* global process */

import express from "express";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import db from "../database/db.js";

const execFileAsync = promisify(execFile);
const router = express.Router();

const uploadDir = "server/uploads";

async function createSeedPhotoPreview(fileName) {
  const sourcePath = path.join(uploadDir, fileName);
  const parsedPath = path.parse(fileName);

  const previewFileName = path.join(
    parsedPath.dir,
    `preview-${parsedPath.base}`,
  );

  const previewPath = path.join(uploadDir, previewFileName);

  await sharp(sourcePath)
    .rotate()
    .trim({ background: "#ffffff", threshold: 25 })
    .resize({
      width: 700,
      height: 700,
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFile(previewPath);

  return previewFileName;
}

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

    const timestamp = Date.now();
    const fileName = `scan-${seedProfileId}-${photoType}-${timestamp}.png`;
    const filePath = path.join(uploadDir, fileName);

    const saneDevice = process.env.SANE_DEVICE;
    const resolution = process.env.SCAN_RESOLUTION || "300";

    const args = [
      "--device-name",
      saneDevice,
      "--resolution",
      resolution,
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
