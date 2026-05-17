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

  const hasSowingExtras =
    pot.sowingDepthNote ||
    pot.sowingNotes ||
    pot.rowSpacingCm ||
    pot.plantSpacingCm ||
    pot.sowingWidthCm;

  const hasHarvestData = pot.harvestFromMonth || pot.harvestToMonth;

  return (
    <div className="pot-detail-card">
      <div className="pot-detail-header">
        <div>
          <h2>{pot.id}</h2>

          <div className="pot-detail-badges">
            <span
              className={`pot-status-badge ${
                pot.status === "empty" ? "empty" : "active"
              }`}
            >
              {formatPotStatus(pot.status)}
            </span>

            {pot.seedProfileId && (
              <span className="pot-profile-badge">{pot.seedProfileId}</span>
            )}
          </div>
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

      <div className="pot-detail-overview">
        <div>
          <span className="detail-label">
            {pot.status === "empty" ? "Letzte Pflanze" : "Pflanze"}
          </span>
          <strong>{pot.plantName || "-"}</strong>
        </div>

        <div>
          <span className="detail-label">Aussaat</span>
          <strong>{pot.sowingDate || "-"}</strong>
        </div>

        <div>
          <span className="detail-label">Nachgesät</span>
          <strong>{pot.resowingDate || "-"}</strong>
        </div>

        <div>
          <span className="detail-label">Lebenszyklus</span>
          <strong>{formatLifecycle(pot.lifecycle)}</strong>
        </div>
      </div>

      <div className="pot-detail-grid">
        <div className="pot-detail-main">
          <section className="detail-section detail-section-card">
            <h3>Grunddaten</h3>

            <div className="detail-fact-grid">
              <p>
                <span className="detail-label">Samenprofil</span>
                <strong>{pot.seedProfileId || "-"}</strong>
              </p>

              <p>
                <span className="detail-label">Status</span>
                <strong>{formatPotStatus(pot.status)}</strong>
              </p>
            </div>
          </section>

          <section className="detail-section detail-section-card">
            <h3>Keimung</h3>

            <div className="detail-fact-grid">
              <p>
                <span className="detail-label">Temperatur</span>
                <strong>
                  {pot.germinationTempMin || "-"} bis{" "}
                  {pot.germinationTempMax || "-"} °C
                </strong>
              </p>

              <p>
                <span className="detail-label">Dauer</span>
                <strong>
                  {pot.germinationDaysMin || "-"} bis{" "}
                  {pot.germinationDaysMax || "-"} Tage
                </strong>
              </p>
            </div>
          </section>

          <section className="detail-section detail-section-card">
            <h3>Aussaat</h3>

            <div className="detail-fact-grid">
              <p>
                <span className="detail-label">Aussaattiefe</span>
                <strong>{pot.sowingDepthCm ?? "-"} cm</strong>
              </p>

              <p>
                <span className="detail-label">Packungszeitraum</span>
                <strong>
                  {monthLabels[pot.sowingFromMonth] || "-"} bis{" "}
                  {monthLabels[pot.sowingToMonth] || "-"}
                </strong>
              </p>

              {pot.rowSpacingCm && (
                <p>
                  <span className="detail-label">Reihenabstand</span>
                  <strong>{pot.rowSpacingCm} cm</strong>
                </p>
              )}

              {pot.plantSpacingCm && (
                <p>
                  <span className="detail-label">Pflanzenabstand</span>
                  <strong>{pot.plantSpacingCm} cm</strong>
                </p>
              )}

              {pot.sowingWidthCm && (
                <p>
                  <span className="detail-label">Aussaatbreite</span>
                  <strong>{pot.sowingWidthCm} cm</strong>
                </p>
              )}
            </div>

            {hasSowingExtras && (
              <div className="detail-note-block">
                {pot.sowingDepthNote && (
                  <p className="detail-note">
                    <strong>Hinweis zur Aussaat:</strong> {pot.sowingDepthNote}
                  </p>
                )}

                {pot.sowingNotes && (
                  <p className="detail-note">
                    <strong>Weitere Aussaat-Hinweise:</strong> {pot.sowingNotes}
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="detail-section detail-section-card">
            <h3>Nach draußen</h3>

            <div className="detail-fact-grid">
              <p>
                <span className="detail-label">Zeitraum</span>
                <strong>
                  {monthLabels[pot.outdoorFromMonth] || "-"} bis{" "}
                  {monthLabels[pot.outdoorToMonth] || "-"}
                </strong>
              </p>
            </div>
          </section>

          {hasHarvestData && (
            <section className="detail-section detail-section-card">
              <h3>Ernte</h3>

              <div className="detail-fact-grid">
                <p>
                  <span className="detail-label">Zeitraum</span>
                  <strong>
                    {monthLabels[pot.harvestFromMonth] || "-"} bis{" "}
                    {monthLabels[pot.harvestToMonth] || "-"}
                  </strong>
                </p>
              </div>
            </section>
          )}

          <section className="detail-section detail-section-card">
            <h3>Beobachtungen</h3>

            <p className="detail-note">
              {pot.potNotes || "Keine Notiz vorhanden."}
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
