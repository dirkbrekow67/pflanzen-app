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
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "8px",
          backgroundColour: "#fafafa",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Ausgewählter Topf</h2>
        <p>Bitte wähle einen Topf aus.</p>
      </div>
    );
  }
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        backgroundColor: "#fafafa",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Ausgewählter Topf</h2>
      <div style={{ marginBottom: "16" }}>
        <h3 style={{ marginBottom: "8px" }}>Grunddaten</h3>
        <p>
          <strong>ID:</strong> {pot.id}
        </p>
        <p>
          <strong>Pflanze:</strong> {pot.plantName}
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
      <div style={{ marginBottom: "16x" }}>
        <h3 style={{ marginBottom: "8px" }}>Keimung</h3>
        <p>
          <strong>Keimtemperatur:</strong> {pot.germinationTempMin} bis{" "}
          {pot.germinationTempMax} °C
        </p>
        <p>
          <strong>Keimdauer:</strong> {pot.germinationDaysMin} bis{" "}
          {pot.germinationDaysMax} Tage
        </p>
      </div>
      <div>
        <h3 style={{ marginBottom: "8px" }}>Aussaat</h3>
        <p>
          <strong>Aussaatdatum:</strong> {pot.sowingDate}
        </p>
        <p>
          <strong>Aussaattiefe:</strong> {pot.sowingDepthCm} cm
        </p>
      </div>
      <p>
        <strong>Nach draußen:</strong> {monthLabels[pot.outdoorFromMonth]} bis{" "}
        {monthLabels[pot.outdoorToMonth]}
      </p>
    </div>
  );
}

export default PotDetails;
