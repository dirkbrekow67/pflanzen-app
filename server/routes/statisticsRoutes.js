import express from "express";
import db from "../database/db.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const activePots = db
      .prepare("SELECT COUNT(*) AS count FROM pots WHERE status != 'empty'")
      .get();

    const emptyPots = db
      .prepare("SELECT COUNT(*) AS count FROM pots WHERE status = 'empty'")
      .get();

    const historyCount = db
      .prepare("SELECT COUNT(*) AS count FROM pot_history")
      .get();

    const harvestedCount = db
      .prepare(
        "SELECT COUNT(*) AS count FROM pot_history WHERE endReason = 'geerntet'",
      )
      .get();

    const failedCount = db
      .prepare(
        "SELECT COUNT(*) AS count FROM pot_history WHERE endReason = 'fehlgeschlagen'",
      )
      .get();

    const historyRows = db
      .prepare("SELECT startedAt, endedAt FROM pot_history")
      .all();

    const durations = historyRows
      .map((entry) => {
        if (!entry.startedAt || !entry.endedAt) return null;

        const start = new Date(entry.startedAt);
        const end = new Date(entry.endedAt);

        return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      })
      .filter((days) => days !== null);

    const averageDuration =
      durations.length > 0
        ? Math.round(
            durations.reduce((sum, days) => sum + days, 0) / durations.length,
          )
        : 0;

    const profileResults = db
      .prepare(
        `
    SELECT 
      h.seedProfileId,
      s.plantName,
      s.variety,
      s.manufacturer,
      h.endReason,
      COUNT(*) AS count
    FROM pot_history h
    LEFT JOIN seed_profiles s ON h.seedProfileId = s.id
    WHERE h.seedProfileId IS NOT NULL AND h.seedProfileId != ''
    GROUP BY 
      h.seedProfileId,
      s.plantName,
      s.variety,
      s.manufacturer,
      h.endReason
    ORDER BY s.plantName, s.variety, s.manufacturer
  `,
      )
      .all();

    const profileSummaryMap = {};

    profileResults.forEach((item) => {
      if (!profileSummaryMap[item.seedProfileId]) {
        profileSummaryMap[item.seedProfileId] = {
          seedProfileId: item.seedProfileId,
          plantName: item.plantName || "",
          variety: item.variety || "",
          manufacturer: item.manufacturer || "",
          total: 0,
          successful: 0,
          failed: 0,
          other: 0,
        };
      }

      profileSummaryMap[item.seedProfileId].total += item.count;

      if (item.endReason === "geerntet") {
        profileSummaryMap[item.seedProfileId].successful += item.count;
      } else if (item.endReason === "fehlgeschlagen") {
        profileSummaryMap[item.seedProfileId].failed += item.count;
      } else {
        profileSummaryMap[item.seedProfileId].other += item.count;
      }
    });

    const profileSummary = Object.values(profileSummaryMap).map((item) => ({
      ...item,
      successRate:
        item.total > 0 ? Math.round((item.successful / item.total) * 100) : 0,
    }));

    const topProfiles = [...profileSummary]
      .filter((item) => item.total >= 2)
      .sort((a, b) => {
        if (b.successRate !== a.successRate) {
          return b.successRate - a.successRate;
        }

        return b.total - a.total;
      })
      .slice(0, 5);

    res.json({
      activePots: activePots.count,
      emptyPots: emptyPots.count,
      historyCount: historyCount.count,
      harvestedCount: harvestedCount.count,
      failedCount: failedCount.count,
      averageDuration,
      profileResults,
      profileSummary,
      topProfiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Statistik konnte nicht geladen werden",
    });
  }
});

export default router;
