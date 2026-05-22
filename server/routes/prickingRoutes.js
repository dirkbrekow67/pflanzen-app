// server/routes/prickingRoutes.js

import express from "express";
import db from "../database/db.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { sourcePotId, targetPotIds, prickingDate, totalSeedlings } = req.body;

  if (!sourcePotId) {
    return res.status(400).json({ error: "Ursprungstopf fehlt." });
  }

  if (!Array.isArray(targetPotIds) || targetPotIds.length === 0) {
    return res.status(400).json({ error: "Keine Ziel-Töpfe ausgewählt." });
  }

  if (!prickingDate) {
    return res.status(400).json({ error: "Pikierdatum fehlt." });
  }

  const seedlingsTotal = Number(totalSeedlings);

  if (!Number.isInteger(seedlingsTotal) || seedlingsTotal < 1) {
    return res.status(400).json({
      error: "Anzahl entstandener Pflanzen ist ungültig.",
    });
  }

  if (targetPotIds.length > seedlingsTotal) {
    return res.status(400).json({
      error:
        "Es wurden mehr Ziel-Töpfe ausgewählt als entstandene Pflanzen vorhanden sind.",
    });
  }

  const transaction = db.transaction(() => {
    const sourcePot = db
      .prepare("SELECT * FROM pots WHERE id = ?")
      .get(sourcePotId);

    if (!sourcePot) {
      throw new Error("Ursprungstopf wurde nicht gefunden.");
    }

    if ((sourcePot.status || "active") === "empty") {
      throw new Error("Ursprungstopf ist bereits frei.");
    }

    if (sourcePot.sourcePotId) {
      throw new Error(
        "Dieser Topf ist bereits ein pikierter Ziel-Topf und darf nicht erneut als Ursprungstopf pikiert werden.",
      );
    }

    const targetPots = targetPotIds.map((targetPotId) => {
      const targetPot = db
        .prepare("SELECT * FROM pots WHERE id = ?")
        .get(targetPotId);

      if (!targetPot) {
        throw new Error(`Ziel-Topf ${targetPotId} wurde nicht gefunden.`);
      }

      if ((targetPot.status || "active") !== "empty") {
        throw new Error(`Ziel-Topf ${targetPotId} ist nicht frei.`);
      }

      return targetPot;
    });

    const plantsRemainingInSourcePot = seedlingsTotal - targetPots.length;
    const historyReason =
      plantsRemainingInSourcePot === 0 ? "pikiert" : "teilpikiert";

    const historyNote =
      plantsRemainingInSourcePot === 0
        ? `Vollständig pikiert in ${targetPots.length} Ziel-Topf/Topf(e)`
        : `${targetPots.length} Jungpflanze(n) pikiert in Ziel-Topf/Topf(e); ${plantsRemainingInSourcePot} Pflanze(n) verbleiben im Ursprungstopf`;

    const sourcePotNotes =
      plantsRemainingInSourcePot === 0
        ? sourcePot.potNotes
          ? `${sourcePot.potNotes}\nVollständig pikiert am ${prickingDate}`
          : `Vollständig pikiert am ${prickingDate}`
        : sourcePot.potNotes || "";

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
          sowingNotes = ?,
          sowingMode = ?,
          seedCount = ?,
          seedlingsCount = ?,
          plantsInPot = ?,
          prickedDate = ?,
          sourcePotId = ?
      WHERE id = ?
    `,
    ).run(
      sourcePot.plantName,
      plantsRemainingInSourcePot === 0 ? "empty" : sourcePot.status,
      sourcePot.sowingDate || "",
      sourcePot.resowingDate || "",
      sourcePot.lifecycle || "",
      sourcePot.sowingFromMonth || "",
      sourcePot.sowingToMonth || "",
      sourcePot.germinationTempMin || "",
      sourcePot.germinationTempMax || "",
      sourcePot.germinationDaysMin || "",
      sourcePot.germinationDaysMax || "",
      sourcePot.sowingDepthCm || "",
      sourcePot.outdoorFromMonth || "",
      sourcePot.outdoorToMonth || "",
      sourcePot.seedProfileId || "",
      sourcePotNotes,
      sourcePot.harvestFromMonth || "",
      sourcePot.harvestToMonth || "",
      sourcePot.sowingDepthNote || "",
      sourcePot.rowSpacingCm || "",
      sourcePot.plantSpacingCm || "",
      sourcePot.sowingWidthCm || "",
      sourcePot.sowingNotes || "",
      sourcePot.sowingMode || "single",
      sourcePot.seedCount || "",
      seedlingsTotal,
      plantsRemainingInSourcePot,
      prickingDate,
      sourcePot.sourcePotId || "",
      sourcePot.id,
    );

    db.prepare(
      `
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
    `,
    ).run(
      sourcePot.id,
      sourcePot.plantName || "",
      sourcePot.seedProfileId || "",
      sourcePot.sowingDate || "",
      sourcePot.resowingDate || "",
      sourcePot.potNotes || "",
      sourcePot.sowingDate || "",
      prickingDate,
      historyReason,
      historyNote,
    );

    const updateTargetPot = db.prepare(`
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
          sowingNotes = ?,
          sowingMode = ?,
          seedCount = ?,
          seedlingsCount = ?,
          plantsInPot = ?,
          prickedDate = ?,
          sourcePotId = ?
      WHERE id = ?
    `);

    targetPots.forEach((targetPot) => {
      updateTargetPot.run(
        sourcePot.plantName || "",
        "active",
        sourcePot.sowingDate || "",
        sourcePot.resowingDate || "",
        sourcePot.lifecycle || "",
        sourcePot.sowingFromMonth || "",
        sourcePot.sowingToMonth || "",
        sourcePot.germinationTempMin || "",
        sourcePot.germinationTempMax || "",
        sourcePot.germinationDaysMin || "",
        sourcePot.germinationDaysMax || "",
        sourcePot.sowingDepthCm || "",
        sourcePot.outdoorFromMonth || "",
        sourcePot.outdoorToMonth || "",
        sourcePot.seedProfileId || "",
        `Pikiert aus ${sourcePot.id}`,
        sourcePot.harvestFromMonth || "",
        sourcePot.harvestToMonth || "",
        sourcePot.sowingDepthNote || "",
        sourcePot.rowSpacingCm || "",
        sourcePot.plantSpacingCm || "",
        sourcePot.sowingWidthCm || "",
        sourcePot.sowingNotes || "",
        "single",
        "",
        "",
        1,
        prickingDate,
        sourcePot.id,
        targetPot.id,
      );
    });

    return {
      sourcePotId: sourcePot.id,
      targetPotIds,
      targetCount: targetPots.length,
      plantsRemainingInSourcePot,
      historyReason,
    };
  });

  try {
    const result = transaction();

    res.json({
      success: true,
      message: "Pikieren gespeichert.",
      ...result,
    });
  } catch (error) {
    console.error("Fehler beim Pikieren:", error);

    res.status(400).json({
      error: error.message || "Pikieren konnte nicht gespeichert werden.",
    });
  }
});

export default router;
