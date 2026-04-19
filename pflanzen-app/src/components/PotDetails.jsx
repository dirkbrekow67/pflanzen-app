import { QRCode } from "react-qr-code";

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

function PotDetails({ pot, onEditPot, onClearPot }) {
  if (!pot) {
    return (
      <div className="card-light">
        <h2 style={{ marginTop: 0 }}>Ausgewählter Topf</h2>
        <p>Bitte wähle einen Topf aus.</p>
      </div>
    );
  }

  // Nur wenn pot vorhanden ist:

  const qrValue = `${window.location.origin}/pot/${pot.id}`;
  return (
    <div className="card-light">
      <h2 style={{ marginTop: 0 }}>Ausgewählter Topf</h2>
      <div className="section">
        <h3 className="section-title">Grunddaten</h3>
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
        <p>
          {/* Status zeigt an, ob der Topf aktuell genutzt oder leer ist */}
          <strong>Status:</strong> {pot.status === "empty" ? "Leer" : "Belegt"}
        </p>
      </div>
      <div className="section">
        <h3 className="section-title">Keimung</h3>
        <p>
          <strong>Keimtemperatur:</strong> {pot.germinationTempMin} bis{" "}
          {pot.germinationTempMax} °C
        </p>
        <p>
          <strong>Keimdauer:</strong> {pot.germinationDaysMin} bis{" "}
          {pot.germinationDaysMax} Tage
        </p>
      </div>
      <div className="section">
        <h3 className="section-title">Aussaat</h3>
        <p>
          <strong>Aussaatdatum:</strong> {pot.sowingDate}
        </p>
        <p>
          <strong>Aussaattiefe:</strong> {pot.sowingDepthCm} cm
        </p>
      </div>
      <div className="section">
        <h3 className="section-title">Nach draußen</h3>

        <p>
          <strong>Zeitraum:</strong> {monthLabels[pot.outdoorFromMonth]} bis{" "}
          {monthLabels[pot.outdoorToMonth]}
        </p>
      </div>

      <div className="section">
        <h3 className="section-title">QR-Code</h3>

        <div
          style={{
            background: "white",
            padding: "12px",
            display: "inline-block",
            borderRadius: "8px",
          }}
        >
          <QRCode value={qrValue} size={160} />
        </div>

        <p style={{ marginTop: "12px", wordBreak: "break-all" }}>
          <strong>Zieladresse:</strong> {qrValue}
        </p>
      </div>

      <div className="section">
        {/* Button zum Laden der Topfdaten in das Formular */}
        <button onClick={() => onEditPot(pot)} className="button">
          {pot.status === "empty" ? "Neu belegen" : "Bearbeiten"}
        </button>

        {/* Button zum Leeren des Topfinhalts bei gleichbleibender ID */}
        {pot.status !== "empty" && (
          <button
            onClick={() => onClearPot(pot.id)}
            className="button"
            style={{ marginLeft: "12px" }}
          >
            Topf leeren
          </button>
        )}
      </div>
    </div>
  );
}

export default PotDetails;
