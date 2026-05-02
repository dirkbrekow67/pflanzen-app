export function formatLifecycle(lifecycle) {
  if (lifecycle === "annual") return "Einjährig";
  if (lifecycle === "biennial") return "Zweijährig";
  if (lifecycle === "perennial") return "Mehrjährig";

  return "-";
}

export function formatProfileStatus(profileStatus) {
  if (profileStatus === "nicht-brauchbar") return "Unbrauchbar";
  if (profileStatus === "keimt-schlecht") return "Keimt schlecht";
  if (profileStatus === "wiederverwenden") return "Wiederverwenden";
  if (profileStatus === "testen") return "Testen";

  return "-";
}

export function formatPotStatus(status) {
  return status === "empty" ? "Frei" : "Belegt";
}