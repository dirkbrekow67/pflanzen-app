import { QRCode } from "react-qr-code";
import { QR_BASE_URL } from "../utils/appConfig";
import { monthLabels } from "../constants/months";
import { formatLifecycle, formatPotStatus } from "../utils/formatHelpers";

function PotDetails({ pot, onEditPot, onClearPot }) {
  if (!pot) {
    return (
      <div className="card-light">
        <h2>Ausgewählter Topf</h2>
        <p>Bitte wähle einen Topf aus.</p>
      </div>
    );
  }

  const qrValue = `${QR_BASE_URL}/pot/${pot.id}`;

  return (
    <div className="pot-detail-card">
      <div className="pot-detail-header">
        <div>
          <h2>{pot.id}</h2>
          <p>
            <strong>Status:</strong> {formatPotStatus(pot.status)}
          </p>
          <p>
            <strong>
              {pot.status === "empty" ? "Letztes Profil:" : "Pflanze:"}
            </strong>{" "}
            {pot.plantName || "-"}
          </p>
        </div>

        <div className="pot-detail-actions">
          <button onClick={() => onEditPot(pot)} className="button">
            {pot.status === "empty" ? "Neu belegen" : "Bearbeiten"}
          </button>

          {pot.status !== "empty" && (
            <button onClick={() => onClearPot(pot.id)} className="button">
              Topf freigeben
            </button>
          )}
        </div>
      </div>

      <div className="pot-detail-grid">
        <div className="pot-detail-main">
          <section className="detail-section">
            <h3>Grunddaten</h3>
            <p>
              <strong>Lebensdauer:</strong> {formatLifecycle(pot.lifecycle)}
            </p>
            <p>
              <strong>
                {pot.status === "empty"
                  ? "Letztes Samenprofil:"
                  : "Samenprofil:"}
              </strong>{" "}
              {pot.seedProfileId
                ? `${pot.plantName || "-"} (${pot.seedProfileId})`
                : "Kein Profil zugewiesen"}
            </p>
          </section>

          <section className="detail-section">
            <h3>Keimung</h3>
            <p>
              <strong>Keimtemperatur:</strong> {pot.germinationTempMin} bis{" "}
              {pot.germinationTempMax} °C
            </p>
            <p>
              <strong>Keimdauer:</strong> {pot.germinationDaysMin} bis{" "}
              {pot.germinationDaysMax} Tage
            </p>
          </section>

          <section className="detail-section">
            <h3>Aussaat</h3>
            <p>
              <strong>Aussaatdatum:</strong> {pot.sowingDate || "-"}
            </p>
            <p>
              <strong>Nachgesät am:</strong> {pot.resowingDate || "-"}
            </p>
            <p>
              <strong>Aussaattiefe:</strong> {pot.sowingDepthCm} cm
            </p>
            <p>
              <strong>Aussaat laut Packung:</strong>{" "}
              {monthLabels[pot.sowingFromMonth]} bis{" "}
              {monthLabels[pot.sowingToMonth]}
            </p>
          </section>

          <section className="detail-section">
            <h3>Nach draußen</h3>
            <p>
              <strong>Zeitraum:</strong> {monthLabels[pot.outdoorFromMonth]} bis{" "}
              {monthLabels[pot.outdoorToMonth]}
            </p>
          </section>

          <section className="detail-section">
            <h3>Beobachtungen</h3>
            <p>
              <strong>Topfnotizen:</strong> {pot.potNotes || "-"}
            </p>
          </section>
        </div>

        <aside className="pot-detail-side">
          <h3>QR-Code</h3>

          <div className="qr-box-large">
            <QRCode value={qrValue} size={180} />
          </div>

          <p className="qr-hint">Scannen zum Öffnen dieses Topfs</p>

          <p className="breakable-text">
            <strong>Zieladresse:</strong> {qrValue}
          </p>
        </aside>
      </div>
    </div>
  );
}

export default PotDetails;
