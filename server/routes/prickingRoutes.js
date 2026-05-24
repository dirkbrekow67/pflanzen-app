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
          sourcePotId = ?,
          sourcePlantName = ?,
          sourceSeedProfileId = ?,
          sourcePrickingDate = ?
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
      sourcePot.sourcePlantName || "",
      sourcePot.sourceSeedProfileId || "",
      sourcePot.sourcePrickingDate || "",
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

    db.prepare(
      `
  INSERT INTO pricking_events (
    sourcePotId,
    sourcePlantName,
    sourceSeedProfileId,
    prickingDate,
    totalSeedlings,
    targetPotIdsJson,
    plantsRemainingInSourcePot,
    note
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`,
    ).run(
      sourcePot.id,
      sourcePot.plantName || "",
      sourcePot.seedProfileId || "",
      prickingDate,
      seedlingsTotal,
      JSON.stringify(targetPotIds),
      plantsRemainingInSourcePot,
      "",
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
          sourcePotId = ?,
          sourcePlantName = ?,
          sourceSeedProfileId = ?,
          sourcePrickingDate = ?
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
        sourcePot.plantName || "",
        sourcePot.seedProfileId || "",
        prickingDate,
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

router.get("/legacy-candidates", (req, res) => {
  try {
    const legacyCandidates = db
      .prepare(
        `
        SELECT
          p.id,
          p.plantName,
          p.status,
          p.seedProfileId,
          p.sowingDate,
          p.prickedDate,
          p.sourcePotId,
          p.plantsInPot,
          p.seedlingsCount,
          p.potNotes
        FROM pots p
        WHERE p.prickedDate IS NOT NULL
          AND p.prickedDate != ''
          AND (p.sourcePotId IS NULL OR p.sourcePotId = '')
          AND NOT EXISTS (
            SELECT 1
            FROM pot_history h
            WHERE h.potId = p.id
              AND h.endReason IN ('teilpikiert', 'pikiert')
          )
        ORDER BY p.prickedDate, p.id
      `,
      )
      .all();

    const reviewedCandidates = legacyCandidates.map((pot) => {
      const plantName = (pot.plantName || "").toLowerCase();

      const isLikelyAnnualTomato =
        plantName.includes("tomate") || plantName.includes("tomaten");

      return {
        ...pot,
        recommendation: isLikelyAnnualTomato
          ? "nicht_nachträglich_rekonstruieren"
          : "altbestand_ohne_ursprung",
      };
    });

    res.json({
      total: reviewedCandidates.length,
      candidates: reviewedCandidates,
    });
  } catch (error) {
    console.error("Fehler bei alten Pikierdaten:", error);

    res.status(500).json({
      error: "Alte Pikierdaten konnten nicht geprüft werden.",
    });
  }
});

router.get("/consistency", (req, res) => {
  try {
    const pots = db.prepare("SELECT * FROM pots ORDER BY id").all();

    const potById = new Map(pots.map((pot) => [pot.id, pot]));

    const targetPots = pots.filter(
      (pot) =>
        pot.sourcePotId &&
        pot.sourcePotId !== "" &&
        (pot.status || "active") !== "empty",
    );

    const issues = [];

    targetPots.forEach((targetPot) => {
      const sourcePot = potById.get(targetPot.sourcePotId);

      if (!sourcePot) {
        issues.push({
          severity: "error",
          potId: targetPot.id,
          plantName: targetPot.plantName || "",
          sourcePotId: targetPot.sourcePotId,
          message:
            "Der Ziel-Topf verweist auf einen Ursprungstopf, der nicht mehr vorhanden ist.",
          recommendation:
            "Ursprung manuell prüfen. Herkunftsdaten am Ziel-Topf nachtragen oder Ziel-Topf als Altbestand kennzeichnen.",
        });

        return;
      }

      if (!targetPot.prickedDate) {
        issues.push({
          severity: "warning",
          potId: targetPot.id,
          plantName: targetPot.plantName || "",
          sourcePotId: targetPot.sourcePotId,
          message:
            "Der Ziel-Topf hat einen Ursprungstopf, aber kein Pikierdatum.",
          recommendation:
            "Pikierdatum prüfen und nachtragen, wenn es fachlich bekannt ist.",
        });
      }

      const hasStoredSourceDetails =
        targetPot.sourcePlantName ||
        targetPot.sourceSeedProfileId ||
        targetPot.sourcePrickingDate;

      if (!hasStoredSourceDetails) {
        issues.push({
          severity: "info",
          potId: targetPot.id,
          plantName: targetPot.plantName || "",
          sourcePotId: targetPot.sourcePotId,
          message:
            "Der Ziel-Topf stammt aus älteren Pikierdaten. Zusätzliche Herkunftsdaten sind am Ziel-Topf noch nicht separat gespeichert.",
          recommendation:
            "Kein akuter Fehler. Bei Bedarf Herkunftsdaten später manuell ergänzen. Neue Pikierungen speichern diese Daten automatisch.",
        });
      }

      if (
        targetPot.sourcePrickingDate &&
        targetPot.prickedDate &&
        targetPot.sourcePrickingDate !== targetPot.prickedDate
      ) {
        issues.push({
          severity: "warning",
          potId: targetPot.id,
          plantName: targetPot.plantName || "",
          sourcePotId: targetPot.sourcePotId,
          message:
            "Das Herkunfts-Pikierdatum weicht vom Pikierdatum des Ziel-Topfs ab.",
          recommendation:
            "Pikierdaten prüfen. In der Regel sollten beide Werte identisch sein.",
        });
      }

      if (
        targetPot.sourcePlantName &&
        targetPot.plantName &&
        targetPot.sourcePlantName !== targetPot.plantName
      ) {
        issues.push({
          severity: "warning",
          potId: targetPot.id,
          plantName: targetPot.plantName || "",
          sourcePotId: targetPot.sourcePotId,
          message:
            "Die gespeicherte Herkunftspflanze weicht vom aktuellen Pflanzennamen des Ziel-Topfs ab.",
          recommendation:
            "Prüfen, ob der Ziel-Topf nachträglich umbenannt wurde oder ob Herkunftsdaten falsch gespeichert sind.",
        });
      }

      if (sourcePot.status === "empty" && !hasStoredSourceDetails) {
        issues.push({
          severity: "info",
          potId: targetPot.id,
          plantName: targetPot.plantName || "",
          sourcePotId: targetPot.sourcePotId,
          message:
            "Der Ursprungstopf ist inzwischen frei. Da es sich um ältere Pikierdaten handelt, ist die Herkunft nur eingeschränkt am Ziel-Topf dokumentiert.",
          recommendation:
            "Für Altbestand akzeptabel. Bei neuen Pikierungen bleiben Herkunftsdaten am Ziel-Topf erhalten.",
        });
      }

      if (
        sourcePot.status !== "empty" &&
        sourcePot.plantName &&
        targetPot.plantName &&
        sourcePot.plantName !== targetPot.plantName &&
        !targetPot.sourcePlantName
      ) {
        issues.push({
          severity: "warning",
          potId: targetPot.id,
          plantName: targetPot.plantName || "",
          sourcePotId: targetPot.sourcePotId,
          message:
            "Der Ursprungstopf ist aktiv, enthält aber eine andere Pflanze. Bei älteren Daten kann das auf eine spätere Wiederbelegung hinweisen.",
          recommendation:
            "Prüfen, ob der Ursprungstopf nach der Pikierung neu belegt wurde. Künftig gespeicherte Herkunftsdaten verhindern diese Unklarheit.",
        });
      }
    });

    const issueCounts = issues.reduce(
      (counts, issue) => ({
        ...counts,
        [issue.severity]: (counts[issue.severity] || 0) + 1,
      }),
      {
        error: 0,
        warning: 0,
        info: 0,
      },
    );

    res.json({
      checkedAt: new Date().toISOString(),
      totalTargetPots: targetPots.length,
      totalIssues: issues.length,
      issueCounts,
      issues,
    });
  } catch (error) {
    console.error("Fehler bei der Pikier-Konsistenzprüfung:", error);

    res.status(500).json({
      error: "Pikier-Konsistenz konnte nicht geprüft werden.",
    });
  }
});

router.get("/events", (req, res) => {
  try {
    const events = db
      .prepare(
        `
        SELECT *
        FROM pricking_events
        ORDER BY prickingDate DESC, id DESC
      `,
      )
      .all()
      .map((event) => ({
        ...event,
        targetPotIds: event.targetPotIdsJson
          ? JSON.parse(event.targetPotIdsJson)
          : [],
      }));

    res.json(events);
  } catch (error) {
    console.error("Fehler beim Laden der Pikierereignisse:", error);

    res.status(500).json({
      error: "Pikierereignisse konnten nicht geladen werden.",
    });
  }
});

router.get("/events/:potId", (req, res) => {
  try {
    const { potId } = req.params;

    const events = db
      .prepare(
        `
        SELECT *
        FROM pricking_events
        WHERE sourcePotId = ?
           OR targetPotIdsJson LIKE ?
        ORDER BY prickingDate DESC, id DESC
      `,
      )
      .all(potId, `%"${potId}"%`)
      .map((event) => ({
        ...event,
        targetPotIds: event.targetPotIdsJson
          ? JSON.parse(event.targetPotIdsJson)
          : [],
      }));

    res.json(events);
  } catch (error) {
    console.error("Fehler beim Laden der Topf-Pikierereignisse:", error);

    res.status(500).json({
      error: "Pikierereignisse für diesen Topf konnten nicht geladen werden.",
    });
  }
});

export default router;
