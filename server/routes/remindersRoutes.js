import express from "express";
import db from "../database/db.js";

const router = express.Router();

const DAY_IN_MS = 1000 * 60 * 60 * 24;

function parseDate(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function daysSince(today, date) {
  if (!date) return null;

  return Math.round((today - date) / DAY_IN_MS) + 1;
}

function getLatestPhotoDateByType(photoRows, potId, photoTypes) {
  const matchingDates = photoRows
    .filter(
      (photo) =>
        photo.potId === potId &&
        photoTypes.includes(photo.photoType || "progress") &&
        photo.uploadedAt,
    )
    .map((photo) => parseDate(photo.uploadedAt))
    .filter(Boolean)
    .sort((a, b) => b - a);

  return matchingDates[0] || null;
}

router.get("/", (req, res) => {
  try {
    const pots = db.prepare("SELECT * FROM pots WHERE status != 'empty'").all();
    const photoRows = db
      .prepare(
        `
        SELECT potId, photoType, uploadedAt
        FROM pot_photos
      `,
      )
      .all();

    const today = new Date();
    const reminders = [];

    pots.forEach((pot) => {
      if (!pot.sowingDate) return;

      const sowingDate = parseDate(pot.sowingDate);
      const prickedDate = parseDate(pot.prickedDate);
      const daysSinceSowing = daysSince(today, sowingDate);

      if (!sowingDate || !daysSinceSowing) return;

      const latestGerminationPhotoDate = getLatestPhotoDateByType(
        photoRows,
        pot.id,
        ["germination"],
      );

      const latestGrowthPhotoDate = getLatestPhotoDateByType(
        photoRows,
        pot.id,
        ["progress", "before-pricking", "pricking"],
      );

      const latestOutdoorPhotoDate = getLatestPhotoDateByType(
        photoRows,
        pot.id,
        ["outdoor"],
      );

      const hasBeenPricked = Boolean(pot.prickedDate);

      /*
        Keimkontrolle:
        - nicht mehr anzeigen, wenn bereits pikiert wurde
        - nicht mehr anzeigen, wenn bereits ein Keimkontrollfoto vorhanden ist
      */
      if (
        !hasBeenPricked &&
        !latestGerminationPhotoDate &&
        pot.germinationDaysMax &&
        daysSinceSowing > pot.germinationDaysMax
      ) {
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

      /*
        Wuchs / Vereinzeln / Umtopfen:
        - vor dem Pikieren: erstmals nach 21 Tagen seit Aussaat
        - nach Foto oder Pikierung: neue Prüfung erst nach 14 Tagen
        - dadurch verschwindet der alte Hinweis nach Pikieren oder Fotoaufnahme
      */
      const growthBaseDate = latestGrowthPhotoDate || prickedDate || sowingDate;

      const daysSinceGrowthBase = daysSince(today, growthBaseDate);

      const growthCheckThresholdDays =
        latestGrowthPhotoDate || prickedDate ? 14 : 21;

      if (
        daysSinceGrowthBase &&
        daysSinceGrowthBase >= growthCheckThresholdDays
      ) {
        reminders.push({
          potId: pot.id,
          plantName: pot.plantName,
          type: "growth-check",
          message: hasBeenPricked
            ? "Entwicklung nach dem Pikieren prüfen"
            : "Wuchs prüfen – ggf. vereinzeln oder umtopfen",
          explanation: hasBeenPricked
            ? "Prüfe die Entwicklung nach dem Pikieren. Bei Bedarf ein neues Entwicklungsfoto aufnehmen, Standort, Feuchtigkeit und Wuchs beurteilen."
            : "Prüfe, ob die Pflanzen im Topf genügend Platz haben. Wenn mehrere Jungpflanzen sehr dicht stehen, können sie vorsichtig vereinzelt oder in größere bzw. eigene Töpfe umgesetzt werden. Bei Kräutern kann ein dichterer Wuchs je nach Art auch gewünscht sein.",
          daysSinceSowing,
          daysSinceLastCheck: daysSinceGrowthBase,
          nextCheckBasis: latestGrowthPhotoDate
            ? "letztes Foto"
            : prickedDate
              ? "Pikierdatum"
              : "Aussaatdatum",
        });
      }

      /*
        Nach draußen:
        - weiterhin nach Monatsfenster anzeigen
        - nach Outdoor-Foto 14 Tage pausieren
      */
      if (pot.outdoorFromMonth && pot.outdoorToMonth) {
        const currentMonth = today.getMonth() + 1;
        const daysSinceOutdoorPhoto = daysSince(today, latestOutdoorPhotoDate);

        if (
          currentMonth >= pot.outdoorFromMonth &&
          currentMonth <= pot.outdoorToMonth &&
          (!daysSinceOutdoorPhoto || daysSinceOutdoorPhoto >= 14)
        ) {
          reminders.push({
            potId: pot.id,
            plantName: pot.plantName,
            type: "outdoor-check",
            message: "Nach draußen setzen prüfen",
            explanation:
              "Der empfohlene Zeitraum für das Auspflanzen hat begonnen. Prüfe, ob die Pflanze kräftig genug ist und die Temperaturen geeignet sind. Nach einem passenden Foto wird dieser Hinweis für 14 Tage pausiert.",
            daysSinceSowing,
            outdoorFromMonth: pot.outdoorFromMonth,
            outdoorToMonth: pot.outdoorToMonth,
          });
        }
      }
    });

    const priorityOrder = {
      "germination-check": 1,
      "growth-check": 2,
      "outdoor-check": 3,
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

export default router;
