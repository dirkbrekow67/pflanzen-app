import Tesseract from "tesseract.js";
import sharp from "sharp";
import path from "path";
import db from "../database/db.js";
import {
  normalizeMonthName,
  getMonthNumber,
} from "../../src/constants/months.js";
import { COMMON_PLANT_NAMES } from "../../src/constants/plants.js";

const MONTH_REGEX =
  "januar|februar|märz|maerz|marz|april|mai|juni|juli|august|september|oktober|november|dezember";

export async function processSeedProfilePhotoOcr({
  photo,
  photoId,
  uploadDir,
}) {
  try {
    const imagePath = path.join(uploadDir, photo.fileName);
    const parsedPath = path.parse(photo.fileName);
    const processedFileName = path.join(
      parsedPath.dir,
      `ocr-${parsedPath.base}`,
    );
    const processedImagePath = path.join(uploadDir, processedFileName);
    const isBackPhoto = photo.photoType === "pack_back";

    const imageMetadata = await sharp(imagePath).metadata();

    await sharp(imagePath)
      .rotate()
      .extract({
        left: 0,
        top: 0,
        width: Math.min(imageMetadata.width || 1200, 1200),
        height: Math.min(imageMetadata.height || 1800, 1800),
      })
      .resize({ width: 2400 })
      .grayscale()
      .normalize()
      .sharpen()
      .toFile(processedImagePath);

    const result = await Tesseract.recognize(processedImagePath, "deu+eng");

    const ocrText = result.data.text;
    const cleanedText = ocrText
      .replace(/ﬁ/g, "fi")
      .replace(/ﬂ/g, "fl")
      .replace(/jahrig/g, "jährig")
      .replace(/fiir/g, "für")
      .replace(/Qualitat/g, "Qualität")
      .replace(/\|/g, " ")
      .replace(/[©®]/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s+/g, "\n")
      .trim();

    const fullText = cleanedText.replace(/\s+/g, " ");
    const fullTextLower = fullText.toLowerCase();

    const searchTextLower = fullTextLower
      .replace(/-\s+/g, "")
      .replace(/(\d+)\s*-\s*facher/g, "$1-facher")
      .replace(/in(\d+)facher/g, "in $1-facher")
      .replace(/samenst[aä]rke/g, "samenstärke")
      .replace(/samenstarke/g, "samenstärke")
      .replace(/(\d+)fachersa\s*menst[aä]rke/g, "$1-facher samenstärke")
      .replace(/(\d+)fachersa\s*menstarke/g, "$1-facher samenstärke")
      .replace(/erde\s+bedecken/g, "erde bedecken")
      .replace(/\s+/g, " ");

    const parsedData = {
      plantName: "",
      manufacturer: "",
      retailer: "",
      lifecycle: "",
      sowingMonths: "",
      sowingFromMonth: null,
      sowingToMonth: null,
      germinationDays: "",
      sowingDepth: "",
      germinationTemp: "",
      rowSpacingCm: "",
      plantSpacingCm: "",
      harvestFromMonth: null,
      harvestToMonth: null,
      harvestMonths: "",
      outdoorMonths: null,
    };

    const lines = cleanedText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (fullTextLower.includes("kiepenkerl")) {
      parsedData.manufacturer = "Kiepenkerl";
    }

    if (fullTextLower.includes("netto marken-discount")) {
      parsedData.retailer = "Netto Marken-Discount Stiftung & Co.";
    }

    if (
      fullTextLower.includes("gartenland gmbh") ||
      fullTextLower.includes("gartenland.com")
    ) {
      parsedData.manufacturer = "Gartenland";
    }

    lines.forEach((line) => {
      const lower = line.toLowerCase();

      if (!parsedData.plantName) {
        for (const plant of COMMON_PLANT_NAMES) {
          if (lower.includes(plant.toLowerCase())) {
            parsedData.plantName = plant;
            break;
          }
        }
      }

      if (lower.includes("einjährig") || lower.includes("einjahrig")) {
        parsedData.lifecycle = "annual";
      }

      if (lower.includes("zweijährig") || lower.includes("zweijahrig")) {
        parsedData.lifecycle = "biennial";
      }

      if (lower.includes("mehrjährig") || lower.includes("mehrjahrig")) {
        parsedData.lifecycle = "perennial";
      }

      if (isBackPhoto) {
        const daysMatch = line.match(/(\d+\s*-\s*\d+)\s*tage/i);
        if (daysMatch) {
          parsedData.germinationDays = daysMatch[1].replace(/\s/g, "");
        }

        const tempMatch = line.match(/(\d+\s*-\s*\d+)\s*°\s*c/i);
        if (tempMatch) {
          parsedData.germinationTemp = tempMatch[1].replace(/\s/g, "");
        }

        const spacingMatch = line.match(/(\d+)\s*x\s*(\d+)\s*cm/i);

        if (spacingMatch) {
          parsedData.rowSpacingCm = spacingMatch[1];
          parsedData.plantSpacingCm = spacingMatch[2];
        }

        const depthMatch = line.match(/(\d+(?:[,.]\d+)?)\s*cm\s*tief/i);
        const seedStrengthDepthMatch = lower.match(
          /(?:in\s*)?(\d+)\s*facher\s*samenst[aä]rke/i,
        );

        if (!parsedData.sowingDepth && seedStrengthDepthMatch) {
          parsedData.sowingDepth = `${seedStrengthDepthMatch[1]}x Samenstärke`;
        }
        if (depthMatch) {
          parsedData.sowingDepth = depthMatch[1].replace(",", ".");
        }
        const lightGerminatorMatch = lower.match(
          /lichtkeimer|nicht\s+mit\s+erde\s+(?:bedecken|überdecken)/i,
        );

        if (lightGerminatorMatch) {
          parsedData.sowingDepth = "Lichtkeimer";
        }
        const pressOnlyMatch = lower.match(/nur\s+andr[üu]cken/i);

        if (pressOnlyMatch && !parsedData.sowingDepth) {
          parsedData.sowingDepth = "Nur andrücken";
        }
      }
    });

    if (
      parsedData.plantName === "Liebstock" ||
      parsedData.plantName === "Maggikraut"
    ) {
      parsedData.plantName = "Liebstöckel";
    }

    if (isBackPhoto && !parsedData.sowingDepth) {
      const seedStrengthFullTextMatch = searchTextLower.match(
        /(?:in\s*)?(\d+)[-\s]*facher\s+samenstärke/i,
      );

      const seedStrengthLooseMatch = fullTextLower.match(
        /in\s*(\d+)\s*facher?.{0,120}?menst[aä]rke/i,
      );

      if (!parsedData.sowingDepth && seedStrengthLooseMatch) {
        parsedData.sowingDepth = `${seedStrengthLooseMatch[1]}x Samenstärke`;
      }

      if (seedStrengthFullTextMatch) {
        parsedData.sowingDepth = `${seedStrengthFullTextMatch[1]}x Samenstärke`;
      }
    }

    if (isBackPhoto) {
      const harvestMatch = fullTextLower.match(
        new RegExp(
          `ernte.{0,80}?(${MONTH_REGEX})\\s+bis\\s+(${MONTH_REGEX})`,
          "i",
        ),
      );

      if (harvestMatch) {
        const fromMonth = normalizeMonthName(harvestMatch[1]);
        const toMonth = normalizeMonthName(harvestMatch[2]);

        parsedData.harvestMonths = `${fromMonth} bis ${toMonth}`;

        parsedData.harvestFromMonth = getMonthNumber(fromMonth);
        parsedData.harvestToMonth = getMonthNumber(toMonth);
      }

      const harvestFreilandMatch = fullTextLower.match(
        new RegExp(
          `ernte[\\s\\S]{0,120}?freiland:?\\s*(${MONTH_REGEX})\\s*(?:-|bis)\\s*(${MONTH_REGEX})`,
          "i",
        ),
      );

      if (!harvestMatch && harvestFreilandMatch) {
        const fromMonth = normalizeMonthName(harvestFreilandMatch[1]);
        const toMonth = normalizeMonthName(harvestFreilandMatch[2]);

        parsedData.harvestMonths = `${fromMonth} bis ${toMonth}`;
        parsedData.harvestFromMonth = getMonthNumber(fromMonth);
        parsedData.harvestToMonth = getMonthNumber(toMonth);
      }

      const sowingMatch = fullTextLower.match(
        new RegExp(
          `aussaat[\\s\\S]{0,150}?(${MONTH_REGEX})\\s*(?:-|bis)\\s*(${MONTH_REGEX})`,
          "i",
        ),
      );

      if (sowingMatch) {
        const fromMonth = normalizeMonthName(sowingMatch[1]);
        const toMonth = normalizeMonthName(sowingMatch[2]);

        parsedData.sowingMonths = `${fromMonth} bis ${toMonth}`;
        parsedData.sowingFromMonth = getMonthNumber(fromMonth);
        parsedData.sowingToMonth = getMonthNumber(toMonth);
      }

      const looseMonthRangeMatch = fullTextLower.match(
        new RegExp(`(${MONTH_REGEX}).{0,80}?(${MONTH_REGEX})`, "i"),
      );

      if (!parsedData.sowingFromMonth && looseMonthRangeMatch) {
        const fromMonth = normalizeMonthName(looseMonthRangeMatch[1]);
        const toMonth = normalizeMonthName(looseMonthRangeMatch[2]);

        if (fromMonth !== toMonth) {
          parsedData.sowingMonths = `${fromMonth} bis ${toMonth}`;
          parsedData.sowingFromMonth = getMonthNumber(fromMonth);
          parsedData.sowingToMonth = getMonthNumber(toMonth);
        }
      }

      const directFreilandMatch = fullTextLower.match(
        new RegExp(`(${MONTH_REGEX})\\s+direkt\\s+ins\\s+freiland`, "i"),
      );

      if (directFreilandMatch) {
        parsedData.outdoorMonths = {
          from: normalizeMonthName(directFreilandMatch[1]),
          to: normalizeMonthName(directFreilandMatch[1]),
        };
      }
    }

    db.prepare(
      `
  UPDATE seed_profile_photos
  SET
    ocrStatus = 'done',
    ocrText = ?,
    ocrParsed = ?,
    processedFileName = ?
  WHERE id = ?
`,
    ).run(cleanedText, JSON.stringify(parsedData), processedFileName, photoId);

    console.log("OCR abgeschlossen für Foto:", photoId, parsedData);
  } catch (error) {
    console.error("OCR Fehler:", error);

    db.prepare(
      `
      UPDATE seed_profile_photos
      SET ocrStatus = 'error'
      WHERE id = ?
    `,
    ).run(photoId);
  }
}
