import express from "express";
import db from "../database/db.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const pots = db.prepare("SELECT * FROM pots WHERE status != 'empty'").all();
    const today = new Date();

    const reminders = [];

    pots.forEach((pot) => {
      if (!pot.sowingDate) return;

      const sowingDate = new Date(pot.sowingDate);
      const daysSinceSowing =
        Math.round((today - sowingDate) / (1000 * 60 * 60 * 24)) + 1;

      if (pot.germinationDaysMax && daysSinceSowing > pot.germinationDaysMax) {
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

      if (daysSinceSowing >= 21) {
        reminders.push({
          potId: pot.id,
          plantName: pot.plantName,
          type: "repot-check",
          message: "Wuchs prüfen – ggf. vereinzeln oder umtopfen",
          explanation:
            "Prüfe, ob die Pflanzen im Topf genügend Platz haben. Wenn mehrere Jungpflanzen sehr dicht stehen, können sie vorsichtig vereinzelt oder in größere bzw. eigene Töpfe umgesetzt werden. Bei Kräutern kann ein dichterer Wuchs je nach Art auch gewünscht sein.",
          daysSinceSowing,
        });
      }
      if (pot.outdoorFromMonth && pot.outdoorToMonth) {
        const currentMonth = today.getMonth() + 1;

        if (
          currentMonth >= pot.outdoorFromMonth &&
          currentMonth <= pot.outdoorToMonth
        ) {
          reminders.push({
            potId: pot.id,
            plantName: pot.plantName,
            type: "outdoor-check",
            message: "Nach draußen setzen prüfen",
            explanation:
              "Der empfohlene Zeitraum für das Auspflanzen hat begonnen. Prüfe, ob die Pflanze kräftig genug ist und die Temperaturen geeignet sind (kein Frost).",
            daysSinceSowing,
            outdoorFromMonth: pot.outdoorFromMonth,
            outdoorToMonth: pot.outdoorToMonth,
          });
        }
      }
    });

    const priorityOrder = {
      "germination-check": 1,
      "repot-check": 2,
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
