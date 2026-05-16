import Tesseract from "tesseract.js";
import sharp from "sharp";
import path from "path";
import db from "../database/db.js";
import {
  normalizeMonthName,
  getMonthNumber,
  getMonthValueByName,
} from "../../src/constants/months.js";
import { COMMON_PLANT_NAMES } from "../../src/constants/plants.js";
import {
  sanitizeDayRange,
  sanitizeTemperatureRange,
  sanitizeNumber,
  sanitizeSpacingCm,
} from "../../src/utils/ocrHelpers.js";

const MONTH_REGEX =
  "januar|februar|märz|maerz|marz|april|mai|juni|juli|august|september|oktober|november|dezember";

const ROMAN_MONTH_REGEX = "xii|xi|viii|vii|vi|iv|ix|iii|ii|x|v|i";

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
    await sharp(imagePath)
      .rotate()
      .trim({ background: "#ffffff", threshold: 20 })
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
      .replace(/\berte\s*:/gi, "Ernte:")
      .replace(/\bemte\s*:/gi, "Ernte:")
      .replace(/\boitober\b/gi, "Oktober")
      .replace(/\btags?\s*bei\b/gi, "Tage bei")
      .replace(/\b7age\b/gi, "Tage")
      .replace(/\bV[Ii][l1][l1]\b/g, "VIII")
      .replace(/\bV[l1][l1][l1]\b/g, "VIII")
      .replace(/\bjull\b/gi, "Juli")
      .replace(/andrü-\s*cken/gi, "andrücken")
      .replace(/andrue-\s*cken/gi, "andrücken")
      .replace(/andr[üu]\s*cken/gi, "andrücken")
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
      sowingWidthCm: "",
      sowingNotes: "",
      germinationTemp: "",
      rowSpacingCm: "",
      plantSpacingCm: "",
      harvestFromMonth: null,
      harvestToMonth: null,
      harvestMonths: "",
      outdoorMonths: null,

      warnings: [],
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

      if (
        !parsedData.plantName &&
        /einlege\s*-?\s*gurke|gewürzgurke|gewürzgurke|cornichon/i.test(line)
      ) {
        parsedData.plantName = "Einlegegurke";
      }

      if (!parsedData.plantName) {
        for (const plant of COMMON_PLANT_NAMES) {
          const plantLower = plant.toLowerCase();

          if (
            plantLower === "gurke" &&
            /\bfür\s+gurken\b|\bgurken,\s*fisch\b/i.test(line)
          ) {
            continue;
          }

          if (lower.includes(plantLower)) {
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
        const daysMatch = line.match(
          /(\d+\s*(?:-|–|—|bis)\s*\d+)\s*(?:tage|7age)/i,
        );
        if (daysMatch) {
          parsedData.germinationDays = sanitizeDayRange(daysMatch[1]);
        }

        const tempMatch = line.match(
          /(\d+\s*(?:-|–|—|bis)\s*\d+)\s*(?:°\s*c|grad)/i,
        );

        const tempContext = tempMatch
          ? fullTextLower.slice(
              Math.max(
                0,
                fullTextLower.indexOf(tempMatch[0].toLowerCase()) - 120,
              ),
              fullTextLower.indexOf(tempMatch[0].toLowerCase()) + 120,
            )
          : "";

        const isColdTreatmentTemperature =
          /kaltkeimer|kälteperiode|kalteperiode|kallegoliode|k[aä]lteperiode|5-10\s*°\s*c\s+günstig/i.test(
            tempContext,
          );

        if (tempMatch && !isColdTreatmentTemperature) {
          parsedData.germinationTemp = sanitizeTemperatureRange(tempMatch[1]);
        }

        const spacingMatch = line.match(/(\d+)\s*(?:x|×|mal)\s*(\d+)\s*cm/i);

        if (spacingMatch) {
          const rowSpacingValue =
            spacingMatch[1] === "95" && spacingMatch[2] === "15"
              ? "25"
              : spacingMatch[1];

          parsedData.rowSpacingCm = sanitizeSpacingCm(rowSpacingValue);
          parsedData.plantSpacingCm = sanitizeSpacingCm(spacingMatch[2]);
        }

        const sowingWidthMatch = line.match(
          /(\d+(?:[,.]\d+)?)\s*cm\s*(?:breit|breite)/i,
        );

        if (sowingWidthMatch) {
          parsedData.sowingWidthCm = sanitizeSpacingCm(sowingWidthMatch[1]);
        }

        const depthMatch = line.match(/(\d+(?:[,.]\d+)?)\s*cm\s*tief/i);
        const seedStrengthDepthMatch = lower.match(
          /(?:in\s*)?(\d+)\s*facher\s*samenst[aä]rke/i,
        );

        if (!parsedData.sowingDepth && seedStrengthDepthMatch) {
          parsedData.sowingDepth = `${seedStrengthDepthMatch[1]}x Samenstärke`;
        }

        if (depthMatch) {
          parsedData.sowingDepth = sanitizeNumber(depthMatch[1]);
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

    if (isBackPhoto && !parsedData.germinationDays) {
      const daysFullTextMatch = fullTextLower.match(
        /(\d+\s*(?:-|–|—|bis)\s*\d+)\s*(?:tage|7age)/i,
      );

      if (daysFullTextMatch) {
        parsedData.germinationDays = sanitizeDayRange(daysFullTextMatch[1]);
      }
    }

    if (isBackPhoto && !parsedData.germinationTemp) {
      const tempFullTextMatch = fullTextLower.match(
        /bei\s+(\d+\s*(?:-|–|—|bis)\s*\d+)\s*(?:°\s*c|grad)/i,
      );

      if (tempFullTextMatch) {
        const tempContext = fullTextLower.slice(
          Math.max(0, tempFullTextMatch.index - 120),
          tempFullTextMatch.index + 120,
        );

        const isColdTreatmentTemperature =
          /kaltkeimer|kälteperiode|kalteperiode|kallegoliode|k[aä]lteperiode|5-10\s*°\s*c\s+günstig/i.test(
            tempContext,
          );

        if (!isColdTreatmentTemperature) {
          parsedData.germinationTemp = sanitizeTemperatureRange(
            tempFullTextMatch[1],
          );
        }
      }
    }

    const fullSowingHints = [];

    if (fullTextLower.includes("leicht mit erde bedecken")) {
      fullSowingHints.push("Leicht mit Erde bedecken");
    }

    if (
      fullTextLower.includes("andrücken") ||
      fullTextLower.includes("andruecken")
    ) {
      fullSowingHints.push("Andrücken");
    }

    if (fullTextLower.includes("feucht halten")) {
      fullSowingHints.push("Feucht halten");
    }

    if (fullSowingHints.length > 0) {
      parsedData.sowingNotes = fullSowingHints.join(", ");
    }

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

      const seedStrengthBrokenOneMatch =
        /(?:1|i|l|ing)[-\s]*facher.{0,160}?(?:samenst[aä]rke|menstarke)/i.test(
          searchTextLower,
        );

      if (!parsedData.sowingDepth && seedStrengthLooseMatch) {
        parsedData.sowingDepth = `${seedStrengthLooseMatch[1]}x Samenstärke`;
      }

      if (!parsedData.sowingDepth && seedStrengthFullTextMatch) {
        parsedData.sowingDepth = `${seedStrengthFullTextMatch[1]}x Samenstärke`;
      }

      if (!parsedData.sowingDepth && seedStrengthBrokenOneMatch) {
        parsedData.sowingDepth = "1x Samenstärke";
      }
    }

    if (isBackPhoto) {
      const sowingRomanMatch = fullTextLower.match(
        new RegExp(
          `aussaat[\\s\\S]{0,120}?\\b(${ROMAN_MONTH_REGEX})\\s*(?:-|bis)\\s*(${ROMAN_MONTH_REGEX})\\b`,
          "i",
        ),
      );

      if (sowingRomanMatch) {
        const fromMonth = normalizeMonthName(sowingRomanMatch[1]);
        const toMonth = normalizeMonthName(sowingRomanMatch[2]);

        parsedData.sowingMonths = `${fromMonth} bis ${toMonth}`;
        parsedData.sowingFromMonth = getMonthValueByName(fromMonth);
        parsedData.sowingToMonth = getMonthValueByName(toMonth);
      }

      const sowingTextRangeMatch = fullTextLower.match(
        new RegExp(
          `aussaat[\\s\\S]{0,120}?(?:mitte\\s+)?(${MONTH_REGEX})\\s*(?:-|bis)\\s*(${MONTH_REGEX})`,
          "i",
        ),
      );

      if (sowingTextRangeMatch && !parsedData.sowingFromMonth) {
        const fromMonth = normalizeMonthName(sowingTextRangeMatch[1]);
        const toMonth = normalizeMonthName(sowingTextRangeMatch[2]);
        const fromMonthNumber = getMonthNumber(fromMonth);
        const toMonthNumber = getMonthNumber(toMonth);

        if (fromMonthNumber <= toMonthNumber) {
          parsedData.sowingMonths = `${fromMonth} bis ${toMonth}`;
          parsedData.sowingFromMonth = fromMonthNumber;
          parsedData.sowingToMonth = toMonthNumber;
        }
      }

      const preCultivationRomanMatch = fullTextLower.match(
        new RegExp(
          `vorkultur[\\s\\S]{0,80}?\\b(${ROMAN_MONTH_REGEX})\\s*(?:-|bis)\\s*(${ROMAN_MONTH_REGEX})\\b`,
          "i",
        ),
      );

      if (preCultivationRomanMatch && !parsedData.sowingFromMonth) {
        const fromMonth = normalizeMonthName(preCultivationRomanMatch[1]);
        const toMonth = normalizeMonthName(preCultivationRomanMatch[2]);

        parsedData.sowingMonths = `${fromMonth} bis ${toMonth}`;
        parsedData.sowingFromMonth = getMonthValueByName(fromMonth);
        parsedData.sowingToMonth = getMonthValueByName(toMonth);
      }

      const harvestRomanMatch = fullTextLower.match(
        new RegExp(
          `ernte[\\s\\S]{0,120}?\\b(${ROMAN_MONTH_REGEX})\\s*(?:-|bis)\\s*(${ROMAN_MONTH_REGEX})\\b`,
          "i",
        ),
      );

      if (harvestRomanMatch) {
        const fromMonth = normalizeMonthName(harvestRomanMatch[1]);
        const toMonth = normalizeMonthName(harvestRomanMatch[2]);

        parsedData.harvestMonths = `${fromMonth} bis ${toMonth}`;
        parsedData.harvestFromMonth = getMonthValueByName(fromMonth);
        parsedData.harvestToMonth = getMonthValueByName(toMonth);
      }

      const allRomanMonthRanges = [
        ...fullTextLower.matchAll(
          new RegExp(
            `\\b(${ROMAN_MONTH_REGEX})\\s*(?:-|bis)\\s*(${ROMAN_MONTH_REGEX})\\b`,
            "gi",
          ),
        ),
      ];

      if (!parsedData.harvestFromMonth && allRomanMonthRanges.length > 1) {
        const lastRomanRange =
          allRomanMonthRanges[allRomanMonthRanges.length - 1];
        const fromMonth = normalizeMonthName(lastRomanRange[1]);
        const toMonth = normalizeMonthName(lastRomanRange[2]);

        parsedData.harvestMonths = `${fromMonth} bis ${toMonth}`;
        parsedData.harvestFromMonth = getMonthValueByName(fromMonth);
        parsedData.harvestToMonth = getMonthValueByName(toMonth);
      }

      const iconSpacingMatch = fullTextLower.match(
        /abstand[\s\S]{0,120}?(\d+)\s*(?:x|×|mal)\s*(\d+)\s*cm/i,
      );

      if (iconSpacingMatch && !parsedData.rowSpacingCm) {
        const rowSpacingValue =
          iconSpacingMatch[1] === "95" && iconSpacingMatch[2] === "15"
            ? "25"
            : iconSpacingMatch[1];

        parsedData.rowSpacingCm = sanitizeSpacingCm(rowSpacingValue);
        parsedData.plantSpacingCm = sanitizeSpacingCm(iconSpacingMatch[2]);
      }

      const harvestMatch = fullTextLower.match(
        new RegExp(
          `ernte.{0,80}?(${MONTH_REGEX})\\s+bis\\s+(${MONTH_REGEX})`,
          "i",
        ),
      );

      if (harvestMatch && !parsedData.harvestFromMonth) {
        const fromMonth = normalizeMonthName(harvestMatch[1]);
        const toMonth = normalizeMonthName(harvestMatch[2]);
        const fromMonthNumber = getMonthNumber(fromMonth);
        const toMonthNumber = getMonthNumber(toMonth);

        if (fromMonthNumber <= toMonthNumber) {
          parsedData.harvestMonths = `${fromMonth} bis ${toMonth}`;
          parsedData.harvestFromMonth = fromMonthNumber;
          parsedData.harvestToMonth = toMonthNumber;
        }
      }

      const harvestFreilandMatch = fullTextLower.match(
        new RegExp(
          `ernte[\\s\\S]{0,120}?freiland:?\\s*(${MONTH_REGEX})\\s*(?:-|bis)\\s*(${MONTH_REGEX})`,
          "i",
        ),
      );

      if (!parsedData.harvestFromMonth && harvestFreilandMatch) {
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

      if (sowingMatch && !parsedData.sowingFromMonth) {
        const fromMonth = normalizeMonthName(sowingMatch[1]);
        const toMonth = normalizeMonthName(sowingMatch[2]);
        const fromMonthNumber = getMonthNumber(fromMonth);
        const toMonthNumber = getMonthNumber(toMonth);

        if (fromMonthNumber <= toMonthNumber) {
          parsedData.sowingMonths = `${fromMonth} bis ${toMonth}`;
          parsedData.sowingFromMonth = fromMonthNumber;
          parsedData.sowingToMonth = toMonthNumber;
        }
      }

      const looseMonthRangeMatch = fullTextLower.match(
        new RegExp(`(${MONTH_REGEX}).{0,80}?(${MONTH_REGEX})`, "i"),
      );

      if (!parsedData.sowingFromMonth && looseMonthRangeMatch) {
        const fromMonth = normalizeMonthName(looseMonthRangeMatch[1]);
        const toMonth = normalizeMonthName(looseMonthRangeMatch[2]);
        const fromMonthNumber = getMonthNumber(fromMonth);
        const toMonthNumber = getMonthNumber(toMonth);

        if (fromMonth !== toMonth && fromMonthNumber <= toMonthNumber) {
          parsedData.sowingMonths = `${fromMonth} bis ${toMonth}`;
          parsedData.sowingFromMonth = fromMonthNumber;
          parsedData.sowingToMonth = toMonthNumber;
        }
      }

      const freilandSowingMatch = fullTextLower.match(
        new RegExp(
          `freiland[\\s\\S]{0,80}?(${MONTH_REGEX})\\s*(?:-|bis)\\s*(${MONTH_REGEX})`,
          "i",
        ),
      );

      if (freilandSowingMatch && !parsedData.sowingFromMonth) {
        const fromMonth = normalizeMonthName(freilandSowingMatch[1]);
        const toMonth = normalizeMonthName(freilandSowingMatch[2]);
        const fromMonthNumber = getMonthNumber(fromMonth);
        const toMonthNumber = getMonthNumber(toMonth);

        if (fromMonthNumber <= toMonthNumber) {
          parsedData.sowingMonths = `${fromMonth} bis ${toMonth}`;
          parsedData.sowingFromMonth = fromMonthNumber;
          parsedData.sowingToMonth = toMonthNumber;
        }
      }

      const harvestLooseTextMatch = fullTextLower.match(
        new RegExp(
          `ernte[\\s\\S]{0,120}?(${MONTH_REGEX})\\s*(?:-|bis)\\s*(${MONTH_REGEX})`,
          "i",
        ),
      );

      if (harvestLooseTextMatch && !parsedData.harvestFromMonth) {
        const fromMonth = normalizeMonthName(harvestLooseTextMatch[1]);
        const toMonth = normalizeMonthName(harvestLooseTextMatch[2]);
        const fromMonthNumber = getMonthNumber(fromMonth);
        const toMonthNumber = getMonthNumber(toMonth);

        if (fromMonthNumber <= toMonthNumber) {
          parsedData.harvestMonths = `${fromMonth} bis ${toMonth}`;
          parsedData.harvestFromMonth = fromMonthNumber;
          parsedData.harvestToMonth = toMonthNumber;
        }
      }

      const harvestMaiNovemberFallback = fullTextLower.match(
        /ernte[\s\S]{0,180}?mai\s+bis[\s\S]{0,120}?november/i,
      );

      if (harvestMaiNovemberFallback && !parsedData.harvestFromMonth) {
        parsedData.harvestMonths = "Mai bis November";
        parsedData.harvestFromMonth = 5;
        parsedData.harvestToMonth = 11;
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

    if (!parsedData.plantName) {
      parsedData.warnings.push("Pflanzenname nicht erkannt");
    }

    if (!parsedData.sowingFromMonth) {
      parsedData.warnings.push("Aussaatzeitraum fehlt");
    }

    if (!parsedData.germinationTemp) {
      parsedData.warnings.push("Keimtemperatur fehlt");
    }

    if (!parsedData.germinationDays) {
      parsedData.warnings.push("Keimdauer fehlt");
    }

    parsedData.ocrScore = 100;

    parsedData.ocrScore -= parsedData.warnings.length * 15;

    if (!parsedData.manufacturer) {
      parsedData.ocrScore -= 5;
    }

    if (parsedData.ocrScore < 0) {
      parsedData.ocrScore = 0;
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
