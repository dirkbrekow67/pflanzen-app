export const emptySeedProfile = {
  plantName: "",
  lifecycle: "annual",
  sowingFromMonth: 3,
  sowingToMonth: 5,
  germinationTempMin: 10,
  germinationTempMax: 20,
  germinationDaysMin: 7,
  germinationDaysMax: 14,
  sowingDepthCm: 1,
  outdoorFromMonth: 5,
  outdoorToMonth: 7,
  harvestFromMonth: "",
  harvestToMonth: "",
  variety: "",
  manufacturer: "",
  experience: "",
  profileStatus: "testen",
  profileNotes: "",
  sowingDepthNote: "",
};

export function buildSeedProfileData(seedProfile) {
  return {
    plantName: seedProfile.plantName,
    lifecycle: seedProfile.lifecycle,
    sowingFromMonth: Number(seedProfile.sowingFromMonth),
    sowingToMonth: Number(seedProfile.sowingToMonth),
    germinationTempMin: Number(seedProfile.germinationTempMin),
    germinationTempMax: Number(seedProfile.germinationTempMax),
    germinationDaysMin: Number(seedProfile.germinationDaysMin),
    germinationDaysMax: Number(seedProfile.germinationDaysMax),
    sowingDepthCm:
      seedProfile.sowingDepthCm === ""
        ? null
        : Number(seedProfile.sowingDepthCm),
    outdoorFromMonth: Number(seedProfile.outdoorFromMonth),
    outdoorToMonth: Number(seedProfile.outdoorToMonth),
    harvestFromMonth: seedProfile.harvestFromMonth
      ? Number(seedProfile.harvestFromMonth)
      : null,
    harvestToMonth: seedProfile.harvestToMonth
      ? Number(seedProfile.harvestToMonth)
      : null,
    variety: seedProfile.variety,
    manufacturer: seedProfile.manufacturer,
    experience: seedProfile.experience,
    profileStatus: seedProfile.profileStatus,
    profileNotes: seedProfile.profileNotes,
    sowingDepthNote: seedProfile.sowingDepthNote,
  };
}

export function validateSeedProfile(seedProfile) {
  if (!seedProfile.plantName.trim()) {
    return "Bitte einen Pflanzennamen für das Samenprofil eingeben.";
  }

  if (Number(seedProfile.sowingFromMonth) > Number(seedProfile.sowingToMonth)) {
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
