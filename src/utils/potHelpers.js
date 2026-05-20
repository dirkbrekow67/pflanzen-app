//src/utils/potHelpers.js

export const emptyFormData = {
  plantName: "",
  lifecycle: "annual",
  sowingFromMonth: "",
  sowingToMonth: "",
  germinationTempMin: 10,
  germinationTempMax: 20,
  germinationDaysMin: 10,
  germinationDaysMax: 20,
  sowingDepthCm: 1,
  sowingDate: "",
  outdoorFromMonth: "",
  outdoorToMonth: "",
  harvestFromMonth: "",
  harvestToMonth: "",
  seedProfileId: "",
  resowingDate: "",
  potNotes: "",
  sowingDepthNote: "",
  rowSpacingCm: "",
  plantSpacingCm: "",
  sowingWidthCm: "",
  sowingNotes: "",
};

export const clearedPotData = {
  sowingDate: "",
  resowingDate: "",
  status: "empty",
  potNotes: "",
};

// Ergänzt bei älteren Töpfen einen fehlenden Status und fehlende neue Felder
export function addMissingStatus(potsArray) {
  return potsArray.map((pot) => ({
    ...emptyFormData,
    ...pot,
    status: pot.status || "active",
  }));
}

// Baut aus den aktuellen Formulardaten ein fertiges Topf-Datenobjekt
export function buildPotData(formData) {
  return {
    plantName: formData.plantName,
    sowingDate: formData.sowingDate || new Date().toISOString().split("T")[0],
    sowingDepthCm:
      formData.sowingDepthCm === "" ? "" : Number(formData.sowingDepthCm),
    sowingFromMonth:
      formData.sowingFromMonth === "" ? "" : Number(formData.sowingFromMonth),
    sowingToMonth:
      formData.sowingToMonth === "" ? "" : Number(formData.sowingToMonth),
    germinationTempMin:
      formData.germinationTempMin === ""
        ? ""
        : Number(formData.germinationTempMin),
    germinationTempMax:
      formData.germinationTempMax === ""
        ? ""
        : Number(formData.germinationTempMax),
    germinationDaysMin:
      formData.germinationDaysMin === ""
        ? ""
        : Number(formData.germinationDaysMin),
    germinationDaysMax:
      formData.germinationDaysMax === ""
        ? ""
        : Number(formData.germinationDaysMax),
    outdoorFromMonth:
      formData.outdoorFromMonth === "" ? "" : Number(formData.outdoorFromMonth),
    outdoorToMonth:
      formData.outdoorToMonth === "" ? "" : Number(formData.outdoorToMonth),
    harvestFromMonth:
      formData.harvestFromMonth === "" ? "" : Number(formData.harvestFromMonth),
    harvestToMonth:
      formData.harvestToMonth === "" ? "" : Number(formData.harvestToMonth),
    lifecycle: formData.lifecycle,
    status: "active",
    seedProfileId: formData.seedProfileId || "",
    resowingDate: formData.resowingDate || "",
    potNotes: formData.potNotes || "",
    sowingDepthNote: formData.sowingDepthNote || "",
    rowSpacingCm:
      formData.rowSpacingCm === "" ? "" : Number(formData.rowSpacingCm),
    plantSpacingCm:
      formData.plantSpacingCm === "" ? "" : Number(formData.plantSpacingCm),
    sowingWidthCm:
      formData.sowingWidthCm === "" ? "" : Number(formData.sowingWidthCm),
    sowingNotes: formData.sowingNotes || "",
  };
}

export function validatePotForm(formData) {
  const today = new Date().toISOString().split("T")[0];

  if (formData.sowingDate && formData.sowingDate > today) {
    return "Das Aussaatdatum darf aktuell nicht in der Zukunft liegen.";
  }

  if (!formData.plantName.trim()) {
    return "Bitte einen Pflanzennamen eingeben!";
  }

  if (
    Number(formData.germinationTempMin) > Number(formData.germinationTempMax)
  ) {
    return "Keimtemperatur min darf nicht größer als max sein.";
  }

  if (
    Number(formData.germinationDaysMin) > Number(formData.germinationDaysMax)
  ) {
    return "Keimdauer min darf nicht größer als max sein!";
  }

  if (Number(formData.sowingDepthCm) < 0) {
    return "Aussaattiefe darf nicht negativ sein!";
  }

  if (Number(formData.sowingFromMonth) > Number(formData.sowingToMonth)) {
    return "Der Aussaatzeitraum ist ungültig: Von-Monat darf nicht nach dem Bis-Monat liegen.";
  }

  if (
    formData.outdoorFromMonth &&
    formData.outdoorToMonth &&
    Number(formData.outdoorFromMonth) > Number(formData.outdoorToMonth)
  ) {
    return "Der Zeitraum 'nach draußen' ist ungültig: Von-Monat darf nicht nach dem Bis-Monat liegen.";
  }

  if (
    formData.harvestFromMonth &&
    formData.harvestToMonth &&
    Number(formData.harvestFromMonth) > Number(formData.harvestToMonth)
  ) {
    return "Der Erntezeitraum ist ungültig: Von-Monat darf nicht nach dem Bis-Monat liegen.";
  }

  return "";
}

export function buildEmptyPot(id) {
  return {
    id,
    ...emptyFormData,
    status: "empty",
  };
}

export function getNextPotId(pots) {
  const highestNumber = pots.reduce((highest, pot) => {
    const numberPart = Number(pot.id.replace("TOPF-", ""));
    return numberPart > highest ? numberPart : highest;
  }, 0);

  return "TOPF-" + (highestNumber + 1).toString().padStart(3, "0");
}
