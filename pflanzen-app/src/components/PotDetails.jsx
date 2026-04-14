const monthLabels = {
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

function PotDetails({ pot }) {
  if (!pot) {
    return (
      <div>
        <h2>Ausgewählter Topf</h2>
        <p>Bitte wähle einen Topf aus.</p>
      </div>
    );
  }
  return (
    <div>
      <h2>Ausgewählter Topf</h2>
      <p>
        <strong>ID:</strong> {pot.id}
      </p>
      <p>
        <strong>Pflanze:</strong> {pot.plantName}
      </p>
      <p>
        <strong>Aussaatdatum:</strong> {pot.sowingDate}
      </p>
      <p>
        <strong>Aussaattiefe:</strong> {pot.sowingDepthCm} cm
      </p>
      <p>
        <strong>Keimtemperatur:</strong> {pot.germinationTempMin} bis{" "}
        {pot.germinationTempMax} °C
      </p>
      <p>
        <strong>Keimdauer:</strong> {pot.germinationDaysMin} bis{" "}
        {pot.germinationDaysMax} Tage
      </p>
      <p>
        <strong>Nach draußen:</strong> {monthLabels[pot.outdoorFromMonth]} bis{" "}
        {monthLabels[pot.outdoorToMonth]}
      </p>
      <p>
        <strong>Lebensdauer:</strong>{" "}
        {pot.lifecycle === "annual"
          ? "Einjährig"
          : pot.lifecycle === "biennial"
            ? "Zweijährig"
            : "Mehrjährig"}
      </p>
    </div>
  );
}

export default PotDetails;
