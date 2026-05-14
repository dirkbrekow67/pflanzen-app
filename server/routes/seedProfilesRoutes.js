import express from "express";
import db from "../database/db.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const profiles = db
      .prepare("SELECT * FROM seed_profiles ORDER BY plantName, variety")
      .all();

    res.json(profiles);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Samenprofile konnten nicht geladen werden" });
  }
});

router.post("/", (req, res) => {
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
      sowingDepthNote,
      rowSpacingCm,
      plantSpacingCm,
      outdoorFromMonth,
      outdoorToMonth,
      harvestFromMonth,
      harvestToMonth,
    } = req.body;

    db.prepare(
      `
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
        sowingDepthNote,
        rowSpacingCm,
        plantSpacingCm,
        outdoorFromMonth,
        outdoorToMonth,
        harvestFromMonth,
        harvestToMonth
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
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
      sowingDepthNote,
      rowSpacingCm,
      plantSpacingCm,
      outdoorFromMonth,
      outdoorToMonth,
      harvestFromMonth,
      harvestToMonth,
    );

    res.json({ success: true, message: "Samenprofil gespeichert" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Samenprofil konnte nicht gespeichert werden" });
  }
});

router.put("/:id", (req, res) => {
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
      sowingDepthNote,
      rowSpacingCm,
      plantSpacingCm,
      outdoorFromMonth,
      outdoorToMonth,
      harvestFromMonth,
      harvestToMonth,
    } = req.body;

    db.prepare(
      `
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
          sowingDepthNote = ?,
          rowSpacingCm = ?,
          plantSpacingCm = ?,
          outdoorFromMonth = ?,
          outdoorToMonth = ?,
          harvestFromMonth = ?,
          harvestToMonth = ?
      WHERE id = ?
    `,
    ).run(
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
      sowingDepthNote,
      rowSpacingCm,
      plantSpacingCm,
      outdoorFromMonth,
      outdoorToMonth,
      harvestFromMonth,
      harvestToMonth,
      id,
    );

    res.json({ success: true, message: "Samenprofil aktualisiert" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Samenprofil konnte nicht aktualisiert werden" });
  }
});

export default router;
