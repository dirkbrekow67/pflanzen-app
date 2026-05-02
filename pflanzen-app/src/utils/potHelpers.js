

export const emptyFormData = {
  plantName: "",
  lifecycle: "annual",
  sowingFromMonth: 3,
  sowingToMonth: 5,
  germinationTempMin: 10,
  germinationTempMax: 20,
  germinationDaysMin: 10,
  germinationDaysMax: 20,
  sowingDepthCm: 1,
  sowingDate: "",
  outdoorFromMonth: 5,
  outdoorToMonth: 7,
  seedProfileId: "",
  resowingDate: "",
  potNotes: "",
};

export const clearedPotData = {
  sowingDate: "",
  resowingDate: "",
  status: "empty",
  potNotes: "",
};

// Ergänzt bei älteren Töpfen einen fehlenden Status
export function addMissingStatus(potsArray) {
  return potsArray.map((pot) => ({
    ...pot,
    status: pot.status || "active",
  }));
}

// Baut aus den aktuellen Formulardaten ein fertiges Topf-Datenobjekt
export function buildPotData(formData) {
  return {
    plantName: formData.plantName,
    sowingDate: formData.sowingDate || new Date().toISOString().split("T")[0],
    sowingDepthCm: Number(formData.sowingDepthCm),
    sowingFromMonth: Number(formData.sowingFromMonth),
    sowingToMonth: Number(formData.sowingToMonth),
    germinationTempMin: Number(formData.germinationTempMin),
    germinationTempMax: Number(formData.germinationTempMax),
    germinationDaysMin: Number(formData.germinationDaysMin),
    germinationDaysMax: Number(formData.germinationDaysMax),
    outdoorFromMonth: Number(formData.outdoorFromMonth),
    outdoorToMonth: Number(formData.outdoorToMonth),
    lifecycle: formData.lifecycle,
    status: "active",
    seedProfileId: formData.seedProfileId || "",
    resowingDate: formData.resowingDate,
    potNotes: formData.potNotes,
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

  if (Number(formData.germinationTempMin) > Number(formData.germinationTempMax)) {
    return "Keimtemperatur min darf nicht größer als max sein.";
  }

  if (Number(formData.germinationDaysMin) > Number(formData.germinationDaysMax)) {
    return "Keimdauer min darf nicht größer als max sein!";
  }

  if (Number(formData.sowingDepthCm) < 0) {
    return "Aussaattiefe darf nicht negativ sein!";
  }

  if (Number(formData.sowingFromMonth) > Number(formData.sowingToMonth)) {
    return "Der Aussaatzeitraum ist ungültig: Von-Monat darf nicht nach dem Bis-Monat liegen.";
  }

  if (Number(formData.outdoorFromMonth) > Number(formData.outdoorToMonth)) {
    return "Der Zeitraum 'nach draußen' ist ungültig: Von-Monat darf nicht nach dem Bis-Monat liegen.";
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