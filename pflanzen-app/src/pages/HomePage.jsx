import { Link } from "react-router-dom";
import PotCard from "../components/PotCard";
import PotForm from "../components/PotForm";

function HomePage({
  formData,
  handleFormChange,
  handleAddPot,
  formError,
  editingPotId,
  statusFilter,
  setStatusFilter,
  filteredPots,
  selectedLabelIds,
  handleToggleLabelSelection,
  seedProfiles,
  selectedSeedProfileId,
  setSelectedSeedProfileId,
  handleApplySeedProfile,
  handleExportPots,
  emptyPotCount,
  setEmptyPotCount,
  handleAddEmptyPots,
  reminders,
  hideReminder,
  resetHiddenReminders,
}) {
  return (
    <div className="container">
      <h1>Pflanzen App 🌱</h1>
      {reminders?.length > 0 && (
        <div className="card-light reminder-box">
          <h2>🔔 Hinweise</h2>

          {reminders.map((item, index) => (
            <div key={index} className="reminder-item">
              <p>
                <strong>{item.potId}</strong> – {item.plantName}: {item.message}
              </p>

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
              <div className="filter-bar">
                <button
                  className="button"
                  onClick={() => hideReminder(`${item.potId}-${item.type}`, 1)}
                >
                  +1 Tag
                </button>

                <button
                  className="button"
                  onClick={() => hideReminder(`${item.potId}-${item.type}`, 3)}
                >
                  +3 Tage
                </button>

                <button
                  className="button"
                  onClick={() => hideReminder(`${item.potId}-${item.type}`, 7)}
                >
                  +7 Tage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p>Meine ersten Töpfe</p>
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Aktionen</h2>
        <div className="filter-bar">
          <button onClick={handleExportPots} className="button">
            Topfdaten exportieren
          </button>
          <Link to="/seeds" className="button-link">
            Samenbibliothek öffnen
          </Link>
          <Link to="/statistics" className="button-link">
            Auswertung öffnen
          </Link>
          <button onClick={resetHiddenReminders} className="button">
            Ausgeblendete Hinweise wieder anzeigen
          </button>
        </div>
      </section>
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Leertöpfe vorbereiten</h2>
        <p>
          Erzeuge mehrere freie Töpfe, um dafür QR-Codes zu drucken und die
          Töpfe später zu belegen.
        </p>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Anzahl neuer Leertöpfe
          </label>
          <input
            type="number"
            min="1"
            value={emptyPotCount}
            onChange={(e) => setEmptyPotCount(e.target.value)}
          />
        </div>

        <button onClick={handleAddEmptyPots} className="button">
          Leertöpfe anlegen
        </button>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Topf belegen / bearbeiten</h2>

        <div className="section">
          <h3 className="section-title">Samenprofil laden</h3>
          <p>
            Wähle ein Profil aus der Samenbibliothek und übernimm die Stammdaten
            ins Formular.
          </p>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Samenprofil
            </label>
            <select
              value={selectedSeedProfileId}
              onChange={(e) => setSelectedSeedProfileId(e.target.value)}
            >
              <option value="">Bitte auswählen</option>
              {seedProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.plantName}
                  {profile.variety ? ` – ${profile.variety}` : ""}
                  {profile.manufacturer ? ` – ${profile.manufacturer}` : ""}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleApplySeedProfile} className="button">
            Profil ins Formular übernehmen
          </button>
        </div>

        <PotForm
          formData={formData}
          handleFormChange={handleFormChange}
          handleAddPot={handleAddPot}
          formError={formError}
          editingPotId={editingPotId}
        />
      </section>
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Etiketten / QR-Codes</h2>
        <p>
          Für Etikettendruck ausgewählt:{" "}
          <strong>{selectedLabelIds.length}</strong>
        </p>
        <Link
          to="/labels/print"
          className={`button-link ${selectedLabelIds.length === 0 ? "button-link-disabled" : ""}`}
          onClick={(event) => {
            if (selectedLabelIds.length === 0) {
              event.preventDefault();
            }
          }}
        >
          Etiketten drucken
        </Link>
        {selectedLabelIds.length === 0 && (
          <p>
            Bitte zuerst mindestens einen Topf für den Etikettendruck auswählen.
          </p>
        )}
      </section>
      <section>
        <h2>Topfliste</h2>

        <div className="filter-bar">
          <button
            className={`button ${statusFilter === "all" ? "filter-active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            Alle
          </button>

          <button
            className={`button ${statusFilter === "active" ? "filter-active" : ""}`}
            onClick={() => setStatusFilter("active")}
          >
            Belegt
          </button>

          <button
            className={`button ${statusFilter === "empty" ? "filter-active" : ""}`}
            onClick={() => setStatusFilter("empty")}
          >
            Leer
          </button>
        </div>

        {filteredPots.length === 0 && (
          <p>Für den aktuellen Filter sind keine Töpfe vorhanden.</p>
        )}

        {filteredPots.map((pot) => (
          <div key={pot.id} className="label-select-row">
            <label className="label-select-checkbox">
              <input
                type="checkbox"
                checked={selectedLabelIds.includes(pot.id)}
                onChange={() => handleToggleLabelSelection(pot.id)}
              />
              Etikett auswählen
            </label>

            <Link
              to={`/pot/${pot.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "block",
              }}
            >
              <PotCard
                id={pot.id}
                plantName={pot.plantName}
                sowingDate={pot.sowingDate}
                status={pot.status}
                isSelected={false}
              />
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}

export default HomePage;
