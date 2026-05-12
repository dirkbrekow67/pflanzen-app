import Tesseract from "tesseract.js";
import sharp from "sharp";
import path from "path";
import db from "../database/db.js";
import {
  normalizeMonthName,
  getMonthNumber,
} from "../../src/constants/months.js";

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

    await sharp(imagePath)
      .rotate()
      .extract({
        left: 0,
        top: 0,
        width: 1200,
        height: 1800,
      })
      .resize({ width: 2400 })
      .grayscale()
      .normalize()
      .sharpen()
      .toFile(processedImagePath);

    const result = await Tesseract.recognize(processedImagePath, "deu+eng");

    const ocrText = result.data.text;

    const fullText = ocrText.replace(/\s+/g, " ");
    const fullTextLower = fullText.toLowerCase();

    const parsedData = {
      plantName: "",
      lifecycle: "",
      sowingMonths: "",
      sowingFromMonth: null,
      sowingToMonth: null,
      germinationDays: "",
      sowingDepth: "",
      germinationTemp: "",
      spacing: "",
      harvestFromMonth: null,
      harvestToMonth: null,
      harvestMonths: "",
      outdoorMonths: null,
    };

    const lines = ocrText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    lines.forEach((line) => {
      const lower = line.toLowerCase();

      if (!parsedData.plantName) {
        if (lower.includes("kerbel")) parsedData.plantName = "Kerbel";
        else if (lower.includes("estragon")) {
          parsedData.plantName = "Estragon";
        } else if (lower.includes("brokkoli"))
          parsedData.plantName = "Brokkoli";
        else if (
          lower.includes("cherrytomate") ||
          lower.includes("cherrytomaten")
        ) {
          parsedData.plantName = "Cherrytomate";
        } else if (
          lower.includes("petersilie") &&
          !lower.includes("petersilienähnlich") &&
          !lower.includes("petersiliedhnlich")
        ) {
          parsedData.plantName = "Petersilie";
        } else if (lower.includes("dill")) {
          parsedData.plantName = "Dill";
        }
      }

      if (lower.includes("mehrjährig") || lower.includes("mehrjahrig")) {
        parsedData.lifecycle = "perennial";
      }

      const daysMatch = line.match(/(\d+\s*-\s*\d+)\s*tage/i);
      if (daysMatch) {
        parsedData.germinationDays = daysMatch[1].replace(/\s/g, "");
      }

      const tempMatch = line.match(/(\d+\s*-\s*\d+)\s*°\s*c/i);
      if (tempMatch) {
        parsedData.germinationTemp = tempMatch[1].replace(/\s/g, "");
      }

      const spacingMatch = line.match(/(\d+\s*x\s*\d+)\s*cm/i);
      if (spacingMatch) {
        parsedData.spacing = `${spacingMatch[1].replace(/\s/g, "")} cm`;
      }

      const depthMatch = line.match(/(\d+(?:[,.]\d+)?)\s*cm\s*tief/i);
      if (depthMatch) {
        parsedData.sowingDepth = depthMatch[1].replace(",", ".");
      }
    });

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

    const directFreilandMatch = fullTextLower.match(
      new RegExp(`(${MONTH_REGEX})\\s+direkt\\s+ins\\s+freiland`, "i"),
    );

    if (directFreilandMatch) {
      parsedData.outdoorMonths = {
        from: normalizeMonthName(directFreilandMatch[1]),
        to: normalizeMonthName(directFreilandMatch[1]),
      };
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
    ).run(ocrText, JSON.stringify(parsedData), processedFileName, photoId);

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
