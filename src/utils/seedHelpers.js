export const emptySeedProfile = {
  plantName: "",
  lifecycle: "annual",
  sowingFromMonth: null,
  sowingToMonth: null,
  germinationTempMin: "",
  germinationTempMax: "",
  germinationDaysMin: "",
  germinationDaysMax: "",
  sowingDepthCm: "",
  sowingWidthCm: "",
  sowingNotes: "",
  outdoorFromMonth: null,
  outdoorToMonth: null,
  harvestFromMonth: null,
  harvestToMonth: null,
  variety: "",
  manufacturer: "",
  retailer: "",
  experience: "",
  profileStatus: "testen",
  profileNotes: "",
  sowingDepthNote: "",
  rowSpacingCm: "",
  plantSpacingCm: "",
};

export function buildSeedProfileData(seedProfile) {
  return {
    plantName: seedProfile.plantName,
    lifecycle: seedProfile.lifecycle,
    sowingFromMonth: seedProfile.sowingFromMonth
      ? Number(seedProfile.sowingFromMonth)
      : null,
    sowingToMonth: seedProfile.sowingToMonth
      ? Number(seedProfile.sowingToMonth)
      : null,
    germinationTempMin:
      seedProfile.germinationTempMin === ""
        ? null
        : Number(seedProfile.germinationTempMin),

    germinationTempMax:
      seedProfile.germinationTempMax === ""
        ? null
        : Number(seedProfile.germinationTempMax),

    germinationDaysMin:
      seedProfile.germinationDaysMin === ""
        ? null
        : Number(seedProfile.germinationDaysMin),

    germinationDaysMax:
      seedProfile.germinationDaysMax === ""
        ? null
        : Number(seedProfile.germinationDaysMax),
    sowingDepthCm:
      seedProfile.sowingDepthCm === ""
        ? null
        : Number(seedProfile.sowingDepthCm),
    sowingWidthCm: seedProfile.sowingWidthCm
      ? Number(seedProfile.sowingWidthCm)
      : null,
    sowingNotes: seedProfile.sowingNotes || "",
    outdoorFromMonth: seedProfile.outdoorFromMonth
      ? Number(seedProfile.outdoorFromMonth)
      : null,
    outdoorToMonth: seedProfile.outdoorToMonth
      ? Number(seedProfile.outdoorToMonth)
      : null,
    harvestFromMonth: seedProfile.harvestFromMonth
      ? Number(seedProfile.harvestFromMonth)
      : null,
    harvestToMonth: seedProfile.harvestToMonth
      ? Number(seedProfile.harvestToMonth)
      : null,
    variety: seedProfile.variety,
    manufacturer: seedProfile.manufacturer,
    retailer: seedProfile.retailer || "",
    experience: seedProfile.experience,
    profileStatus: seedProfile.profileStatus,
    profileNotes: seedProfile.profileNotes,
    sowingDepthNote: seedProfile.sowingDepthNote,
    rowSpacingCm:
      seedProfile.rowSpacingCm === "" ? null : Number(seedProfile.rowSpacingCm),
    plantSpacingCm:
      seedProfile.plantSpacingCm === ""
        ? null
        : Number(seedProfile.plantSpacingCm),
  };
}

export function validateSeedProfile(seedProfile) {
  if (!seedProfile.plantName.trim()) {
    return "Bitte einen Pflanzennamen für das Samenprofil eingeben.";
  }

  if (
    seedProfile.sowingFromMonth &&
    seedProfile.sowingToMonth &&
    Number(seedProfile.sowingFromMonth) > Number(seedProfile.sowingToMonth)
  ) {
    return "Der Aussaatzeitraum des Samenprofils ist ungültig.";
  }

  if (
    Number(seedProfile.germinationTempMin) >
    Number(seedProfile.germinationTempMax)
  ) {
    return "Die Keimtemperatur des Samenprofils ist ungültig.";
  }

  if (
    Number(seedProfile.germinationDaysMin) >
    Number(seedProfile.germinationDaysMax)
  ) {
    return "Die Keimdauer des Samenprofils ist ungültig.";
  }

  if (Number(seedProfile.sowingDepthCm) < 0) {
    return "Die Aussaattiefe des Samenprofils darf nicht negativ sein.";
  }

  if (
    seedProfile.outdoorFromMonth &&
    seedProfile.outdoorToMonth &&
    Number(seedProfile.outdoorFromMonth) > Number(seedProfile.outdoorToMonth)
  ) {
    return "Der Zeitraum 'nach draußen' des Samenprofils ist ungültig.";
  }
  if (
    seedProfile.harvestFromMonth &&
    seedProfile.harvestToMonth &&
    Number(seedProfile.harvestFromMonth) > Number(seedProfile.harvestToMonth)
  ) {
    return "Der Erntezeitraum des Samenprofils ist ungültig.";
  }

  return "";
}

export function getNextSeedProfileId(seedProfiles) {
  const highestNumber = seedProfiles.reduce((highest, profile) => {
    const numberPart = Number(profile.id.replace("SEED-", ""));
    return numberPart > highest ? numberPart : highest;
  }, 0);

  return "SEED-" + (highestNumber + 1).toString().padStart(3, "0");
}
