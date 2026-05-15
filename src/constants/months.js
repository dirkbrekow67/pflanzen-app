export const months = [
  { label: "Januar", value: 1 },
  { label: "Februar", value: 2 },
  { label: "März", value: 3 },
  { label: "April", value: 4 },
  { label: "Mai", value: 5 },
  { label: "Juni", value: 6 },
  { label: "Juli", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "Oktober", value: 10 },
  { label: "November", value: 11 },
  { label: "Dezember", value: 12 },
];

export const monthLabels = {
  1: "Januar",
  2: "Februar",
  3: "März",
  4: "April",
  5: "Mai",
  6: "Juni",
  7: "Juli",
  8: "August",
  9: "September",
  10: "Oktober",
  11: "November",
  12: "Dezember",
};

export const monthAliases = {
  januar: "Januar",
  februar: "Februar",
  märz: "März",
  marz: "März",
  maerz: "März",
  april: "April",
  mai: "Mai",
  juni: "Juni",
  juli: "Juli",
  august: "August",
  september: "September",
  oktober: "Oktober",
  november: "November",
  dezember: "Dezember",
};

export const romanMonthAliases = {
  i: "Januar",
  ii: "Februar",
  iii: "März",
  iv: "April",
  v: "Mai",
  vi: "Juni",
  vii: "Juli",
  viii: "August",
  ix: "September",
  x: "Oktober",
  xi: "November",
  xii: "Dezember",
};

export function normalizeMonthName(month) {
  if (!month) return "";

  const lowerMonth = month.toLowerCase();

  return monthAliases[lowerMonth] || romanMonthAliases[lowerMonth] || month;
}

export function getMonthValueByName(month) {
  if (!month) return "";

  const normalizedMonth = normalizeMonthName(month);

  const match = months.find((item) => item.label === normalizedMonth);

  return match?.value || "";
}

export function getMonthNumber(monthName) {
  const entry = Object.entries(monthLabels).find(
    ([, value]) => value === monthName,
  );

  return entry ? Number(entry[0]) : null;
}
