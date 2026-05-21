// src/pages/HomePage.jsx

import { Link } from "react-router-dom";
import { useState } from "react";
import PotCard from "../components/PotCard";

function HomePage({
  statusFilter,
  setStatusFilter,
  filteredPots,
  selectedLabelIds,
  handleToggleLabelSelection,
  handleExportPots,
  emptyPotCount,
  setEmptyPotCount,
  handleAddEmptyPots,
  reminders,
  hideReminder,
  resetHiddenReminders,
  markReminderDone,
}) {
  const [showManagement, setShowManagement] = useState(false);

  const [showLabelSelection, setShowLabelSelection] = useState(false);

  const [expandedReminderKey, setExpandedReminderKey] = useState(null);

  function getReminderKey(item) {
    return `${item.potId}-${item.type}`;
  }

  return (
    <div className="container">
      <h1>Pflanzen App 🌱</h1>
      <section className="dashboard-actions">
        <Link to="/seeds" className="button-link">
          Samenbibliothek öffnen
        </Link>
        <Link to="/planning" className="button-link">
          Pflanzplanung öffnen
        </Link>
        <button
          type="button"
          className="button"
          onClick={() => setShowManagement((current) => !current)}
        >
          {showManagement ? "Verwaltung ausblenden" : "Verwaltung anzeigen"}
        </button>
      </section>
      <section className="card-light planning-dashboard-box">
        <div>
          <h2>Pflanzplanung</h2>
          <p>
            Jahresübersicht für Aussaat, Auspflanzen nach draußen und Ernte auf
            Grundlage der gespeicherten Samenprofile.
          </p>
        </div>

        <Link to="/planning" className="button-link">
          Pflanzplanung öffnen
        </Link>
      </section>
      {reminders?.length > 0 && (
        <section className="card-light reminder-box">
          <h2>Offene Hinweise</h2>

          <div className="reminder-list">
            {reminders.map((item, index) => {
              const reminderKey = getReminderKey(item);

              const isExpanded = expandedReminderKey === reminderKey;

              return (
                <div key={`${reminderKey}-${index}`} className="reminder-item">
                  <div className="reminder-header">
                    <div>
                      <p className="reminder-title">
                        <strong>{item.potId}</strong> – {item.plantName}
                      </p>
                      <p className="reminder-message">{item.message}</p>
                    </div>

                    <div className="reminder-days">
                      {item.daysSinceSowing} Tage
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="reminder-details">
                      <p>
                        <small>Seit Aussaat: {item.daysSinceSowing} Tage</small>
                      </p>

                      {item.germinationDaysMax && (
                        <p>
                          <small>
                            Maximale Keimdauer: {item.germinationDaysMax} Tage
                          </small>
                        </p>
                      )}

                      {item.explanation && (
                        <p>
                          <small>{item.explanation}</small>
                        </p>
                      )}
                    </div>
                  )}

                  <div className="filter-bar reminder-actions">
                    <button
                      className="button"
                      type="button"
                      onClick={() =>
                        setExpandedReminderKey(isExpanded ? null : reminderKey)
                      }
                    >
                      {isExpanded ? "Details ausblenden" : "Details"}
                    </button>

                    <button
                      className="button"
                      onClick={() => hideReminder(reminderKey, 1)}
                    >
                      +1 Tag
                    </button>

                    <button
                      className="button"
                      onClick={() => hideReminder(reminderKey, 3)}
                    >
                      +3 Tage
                    </button>

                    <button
                      className="button"
                      onClick={() => hideReminder(reminderKey, 7)}
                    >
                      +7 Tage
                    </button>

                    <button
                      className="button"
                      onClick={() => markReminderDone(reminderKey)}
                    >
                      Erledigt
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {showManagement && (
        <section className="card management-box">
          <h2 className="no-margin-top">Verwaltung</h2>

          <div className="management-grid">
            <div className="management-card">
              <h3>Leertöpfe vorbereiten</h3>

              <p>
                Erzeuge freie Töpfe, um QR-Codes zu drucken und die Töpfe später
                zu belegen.
              </p>

              <div className="mb-12">
                <label className="label-block">Anzahl neuer Leertöpfe</label>

                <input
                  type="number"
                  min="1"
                  value={emptyPotCount}
                  onChange={(e) => setEmptyPotCount(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleAddEmptyPots}
                className="button"
              >
                Leertöpfe anlegen
              </button>
            </div>

            <div className="management-card">
              <h3>Etiketten / QR-Codes</h3>

              <p>
                Für Etikettendruck ausgewählt:{" "}
                <strong>{selectedLabelIds.length}</strong>
              </p>

              <button
                type="button"
                className="button"
                onClick={() => setShowLabelSelection((current) => !current)}
              >
                {showLabelSelection
                  ? "Etikettenauswahl ausblenden"
                  : "Etikettenauswahl anzeigen"}
              </button>

              <Link
                to="/labels/print"
                className={`button-link ${
                  selectedLabelIds.length === 0 ? "button-link-disabled" : ""
                }`}
                onClick={(event) => {
                  if (selectedLabelIds.length === 0) {
                    event.preventDefault();
                  }
                }}
              >
                Etiketten drucken
              </Link>

              {selectedLabelIds.length === 0 && (
                <p>Bitte zuerst mindestens einen Topf auswählen.</p>
              )}
            </div>

            <div className="management-card">
              <h3>Daten / Auswertung</h3>

              <button
                type="button"
                onClick={handleExportPots}
                className="button"
              >
                Topfdaten exportieren
              </button>

              <Link to="/statistics" className="button-link">
                Auswertung öffnen
              </Link>

              <button
                type="button"
                onClick={resetHiddenReminders}
                className="button"
              >
                Ausgeblendete / erledigte Hinweise wieder anzeigen
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="topf-section">
        <div className="topf-section-header">
          <div>
            <h2>Topfliste</h2>

            <p>Belegte und freie Töpfe im Überblick.</p>
          </div>
          <Link to="/pots/new" className="button-link">
            Topf belegen / neu anlegen
          </Link>
        </div>
        <div className="filter-bar">
          <button
            type="button"
            className={`button ${statusFilter === "all" ? "filter-active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            Alle
          </button>
          <button
            type="button"
            className={`button ${
              statusFilter === "active" ? "filter-active" : ""
            }`}
            onClick={() => setStatusFilter("active")}
          >
            Belegt
          </button>
          <button
            type="button"
            className={`button ${
              statusFilter === "empty" ? "filter-active" : ""
            }`}
            onClick={() => setStatusFilter("empty")}
          >
            Leer
          </button>
        </div>
        {filteredPots.length === 0 && (
          <p>Für den aktuellen Filter sind keine Töpfe vorhanden.</p>
        )}

        <div className="pot-list">
          {filteredPots.map((pot) => (
            <div key={pot.id} className="label-select-row">
              {showLabelSelection && (
                <label className="label-select-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedLabelIds.includes(pot.id)}
                    onChange={() => handleToggleLabelSelection(pot.id)}
                  />
                  Etikett auswählen
                </label>
              )}

              <Link to={`/pot/${pot.id}`} className="card-link">
                <PotCard
                  id={pot.id}
                  plantName={pot.plantName}
                  sowingDate={pot.sowingDate}
                  status={pot.status}
                  prickedDate={pot.prickedDate}
                  sourcePotId={pot.sourcePotId}
                  isSelected={selectedLabelIds.includes(pot.id)}
                />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
