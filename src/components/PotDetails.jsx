// src/components/PotDetails.jsx

import { QRCode } from "react-qr-code";
import { QR_BASE_URL } from "../utils/appConfig";
import { monthLabels } from "../constants/months";
import { formatLifecycle, formatPotStatus } from "../utils/formatHelpers";

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function formatValue(value, unit = "") {
  if (!hasValue(value)) return "-";

  return unit ? `${value} ${unit}` : value;
}

function formatMonthRange(fromMonth, toMonth) {
  const fromLabel = monthLabels[fromMonth] || "-";
  const toLabel = monthLabels[toMonth] || "-";

  return `${fromLabel} bis ${toLabel}`;
}

function formatSowingMode(value) {
  if (value === "multi") return "Mehrere Samen im Topf";
  if (value === "broadcast") return "Flächige Aussaat / Kräuter";

  return "Einzelsaat / eine Pflanze je Topf";
}

function formatDateGerman(value) {
  if (!hasValue(value)) return "-";

  return new Date(value).toLocaleDateString("de-DE");
}

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
    hasValue(pot.sowingDepthNote) ||
    hasValue(pot.sowingNotes) ||
    hasValue(pot.rowSpacingCm) ||
    hasValue(pot.plantSpacingCm) ||
    hasValue(pot.sowingWidthCm) ||
    hasValue(pot.sowingMode) ||
    hasValue(pot.seedCount) ||
    hasValue(pot.seedlingsCount) ||
    hasValue(pot.plantsInPot) ||
    hasValue(pot.prickedDate) ||
    hasValue(pot.sourcePotId);

  const hasHarvestData =
    hasValue(pot.harvestFromMonth) || hasValue(pot.harvestToMonth);

  const hasOutdoorData =
    hasValue(pot.outdoorFromMonth) || hasValue(pot.outdoorToMonth);

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
                  {formatValue(pot.germinationTempMin)} bis{" "}
                  {formatValue(pot.germinationTempMax, "°C")}
                </strong>
              </p>

              <p>
                <span className="detail-label">Dauer</span>
                <strong>
                  {formatValue(pot.germinationDaysMin)} bis{" "}
                  {formatValue(pot.germinationDaysMax, "Tage")}
                </strong>
              </p>
            </div>
          </section>

          <section className="detail-section detail-section-card">
            <h3>Aussaat</h3>

            <div className="detail-fact-grid">
              <p>
                <span className="detail-label">Aussaatdatum</span>
                <strong>{pot.sowingDate || "-"}</strong>
              </p>

              <p>
                <span className="detail-label">Nachgesät am</span>
                <strong>{pot.resowingDate || "-"}</strong>
              </p>

              <p>
                <span className="detail-label">Aussaattiefe</span>
                <strong>{formatValue(pot.sowingDepthCm, "cm")}</strong>
              </p>

              <p>
                <span className="detail-label">Packungszeitraum</span>
                <strong>
                  {formatMonthRange(pot.sowingFromMonth, pot.sowingToMonth)}
                </strong>
              </p>

              <p>
                <span className="detail-label">Reihenabstand</span>
                <strong>{formatValue(pot.rowSpacingCm, "cm")}</strong>
              </p>

              <p>
                <span className="detail-label">Pflanzenabstand</span>
                <strong>{formatValue(pot.plantSpacingCm, "cm")}</strong>
              </p>

              <p>
                <span className="detail-label">Aussaatbreite</span>
                <strong>{formatValue(pot.sowingWidthCm, "cm")}</strong>
              </p>

              <p>
                <span className="detail-label">Aussaat-Art</span>
                <strong>{formatSowingMode(pot.sowingMode)}</strong>
              </p>

              <p>
                <span className="detail-label">Ausgesäte Samen</span>
                <strong>{formatValue(pot.seedCount)}</strong>
              </p>

              <p>
                <span className="detail-label">Entstandene Pflanzen</span>
                <strong>{formatValue(pot.seedlingsCount)}</strong>
              </p>

              <p>
                <span className="detail-label">Pflanzen im Topf</span>
                <strong>{formatValue(pot.plantsInPot)}</strong>
              </p>

              <p>
                <span className="detail-label">Pikiert am</span>
                <strong>{formatDateGerman(pot.prickedDate)}</strong>
              </p>

              <p>
                <span className="detail-label">Ursprungstopf</span>
                <strong>{pot.sourcePotId || "-"}</strong>
              </p>
              <p>
                <span className="detail-label">Herkunft Pflanze</span>
                <strong>{pot.sourcePlantName || "-"}</strong>
              </p>

              <p>
                <span className="detail-label">Herkunft Samenprofil</span>
                <strong>{pot.sourceSeedProfileId || "-"}</strong>
              </p>

              <p>
                <span className="detail-label">Herkunft Pikierdatum</span>
                <strong>{formatDateGerman(pot.sourcePrickingDate)}</strong>
              </p>
            </div>

            {hasSowingExtras && (
              <div className="detail-note-block">
                {hasValue(pot.sowingDepthNote) && (
                  <p className="detail-note">
                    <strong>Hinweis zur Aussaat:</strong> {pot.sowingDepthNote}
                  </p>
                )}

                {hasValue(pot.sowingNotes) && (
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
                  {hasOutdoorData
                    ? formatMonthRange(pot.outdoorFromMonth, pot.outdoorToMonth)
                    : "-"}
                </strong>
              </p>
            </div>
          </section>

          <section className="detail-section detail-section-card">
            <h3>Ernte</h3>

            <div className="detail-fact-grid">
              <p>
                <span className="detail-label">Zeitraum</span>
                <strong>
                  {hasHarvestData
                    ? formatMonthRange(pot.harvestFromMonth, pot.harvestToMonth)
                    : "-"}
                </strong>
              </p>
            </div>
          </section>

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
