export function sanitizeNumber(value) {
  if (value === null || value === undefined) return "";

  const cleaned = String(value)
    .trim()
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  if (!cleaned) return "";

  const numberValue = Number(cleaned);

  return Number.isNaN(numberValue) ? "" : String(numberValue);
}

export function sanitizeRange(value) {
  if (!value) return "";

  const cleaned = String(value)
    .trim()
    .replace(",", ".")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, "")
    .replace(/[^\d.-]/g, "");

  const match = cleaned.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);

  if (!match) return "";

  const min = Number(match[1]);
  const max = Number(match[2]);

  if (Number.isNaN(min) || Number.isNaN(max)) return "";
  if (min > max) return "";

  return `${match[1]}-${match[2]}`;
}

export function sanitizeTemperatureRange(value) {
  const range = sanitizeRange(value);

  if (!range) return "";

  const [min, max] = range.split("-").map(Number);

  if (min < 0 || max > 40) return "";

  return range;
}

export function sanitizeDayRange(value) {
  const range = sanitizeRange(value);

  if (!range) return "";

  const [min, max] = range.split("-").map(Number);

  if (min < 1 || max > 120) return "";

  return range;
}

export function sanitizeSpacingCm(value) {
  const numberValue = sanitizeNumber(value);

  if (!numberValue) return "";

  const parsed = Number(numberValue);

  if (parsed <= 0 || parsed > 300) return "";

  return numberValue;
}
