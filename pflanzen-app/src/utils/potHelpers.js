

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
};

export const clearedPotData = {
  sowingDate: "",
  resowingDate: "",
  status: "empty",
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
  };
}