/* global process */
import express from "express";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    scannerEnabled: process.env.ENABLE_SCANNER === "true",
    saneDevice: process.env.SANE_DEVICE || null,
  });
});

export default router;
