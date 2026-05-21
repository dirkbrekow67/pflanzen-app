// src/pages/PotFormPage.jsx

import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PotForm from "../components/PotForm";
import { monthLabels } from "../constants/months";
import { formatLifecycle } from "../utils/formatHelpers";

function PotFormPage({
  formData,
  handleFormChange,
  handleAddPot,
  formError,
  editingPotId,
  seedProfiles,
  selectedSeedProfileId,
  setSelectedSeedProfileId,
  handleApplySeedProfile,
  handleEditPotById,
}) {
  const navigate = useNavigate();

  const { potId } = useParams();

  useEffect(() => {
    if (!potId) {
      return;
    }

    if (editingPotId === potId) {
      return;
    }

    handleEditPotById(potId);
  }, [potId, editingPotId, handleEditPotById]);

  const selectedSeedProfile = seedProfiles.find(
    (profile) => profile.id === selectedSeedProfileId,
  );

  async function handleSaveAndGoBack() {
    const success = await handleAddPot();

    if (success) {
      navigate("/");
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  return (
    <div className="container">
      <h1>Topf belegen / bearbeiten</h1>

      <div className="page-actions">
        <Link to="/" className="button-link">
          ← Zur Übersicht
        </Link>
      </div>

      <section className="card pot-profile-loader">
        <div className="pot-profile-loader-header">
          <div>
            <h2>Samenprofil laden</h2>

            <p>
              Wähle ein Profil aus der Samenbibliothek und übernimm die
              wichtigsten Stammdaten in den Topf.
            </p>
          </div>

          <Link to="/seeds" className="button-link">
            Samenbibliothek öffnen
          </Link>
        </div>

        <div className="form-field">
          <label>Samenprofil</label>

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

        <button
          type="button"
          onClick={handleApplySeedProfile}
          className="button"
          disabled={!selectedSeedProfileId}
        >
          Profil ins Formular übernehmen
        </button>
      </section>

      {selectedSeedProfile && (
        <section className="seed-profile-summary">
          <div className="seed-profile-summary-header">
            <div>
              <h3>Ausgewähltes Samenprofil</h3>

              <p>
                <strong>{selectedSeedProfile.plantName || "-"}</strong>
                {selectedSeedProfile.variety
                  ? ` – ${selectedSeedProfile.variety}`
                  : ""}
              </p>
            </div>

            <span className="pot-profile-badge">{selectedSeedProfile.id}</span>
          </div>

          <div className="seed-profile-summary-grid">
            <p>
              <span className="detail-label">Hersteller</span>
              <strong>{selectedSeedProfile.manufacturer || "-"}</strong>
            </p>

            <p>
              <span className="detail-label">Händler</span>
              <strong>{selectedSeedProfile.retailer || "-"}</strong>
            </p>

            <p>
              <span className="detail-label">Lebenszyklus</span>
              <strong>{formatLifecycle(selectedSeedProfile.lifecycle)}</strong>
            </p>

            <p>
              <span className="detail-label">Aussaat</span>
              <strong>
                {monthLabels[selectedSeedProfile.sowingFromMonth] || "-"} bis{" "}
                {monthLabels[selectedSeedProfile.sowingToMonth] || "-"}
              </strong>
            </p>

            <p>
              <span className="detail-label">Keimdauer</span>
              <strong>
                {selectedSeedProfile.germinationDaysMin || "-"} bis{" "}
                {selectedSeedProfile.germinationDaysMax || "-"} Tage
              </strong>
            </p>

            <p>
              <span className="detail-label">Keimtemperatur</span>
              <strong>
                {selectedSeedProfile.germinationTempMin || "-"} bis{" "}
                {selectedSeedProfile.germinationTempMax || "-"} °C
              </strong>
            </p>

            <p>
              <span className="detail-label">Aussaattiefe</span>
              <strong>{selectedSeedProfile.sowingDepthCm ?? "-"} cm</strong>
            </p>

            <p>
              <span className="detail-label">Nach draußen</span>
              <strong>
                {monthLabels[selectedSeedProfile.outdoorFromMonth] || "-"} bis{" "}
                {monthLabels[selectedSeedProfile.outdoorToMonth] || "-"}
              </strong>
            </p>

            <p>
              <span className="detail-label">Reihenabstand</span>
              <strong>{selectedSeedProfile.rowSpacingCm || "-"} cm</strong>
            </p>

            <p>
              <span className="detail-label">Pflanzenabstand</span>
              <strong>{selectedSeedProfile.plantSpacingCm || "-"} cm</strong>
            </p>

            <p>
              <span className="detail-label">Aussaatbreite</span>
              <strong>{selectedSeedProfile.sowingWidthCm || "-"} cm</strong>
            </p>

            <p>
              <span className="detail-label">Ernte</span>
              <strong>
                {monthLabels[selectedSeedProfile.harvestFromMonth] || "-"} bis{" "}
                {monthLabels[selectedSeedProfile.harvestToMonth] || "-"}
              </strong>
            </p>
          </div>

          {(selectedSeedProfile.sowingDepthNote ||
            selectedSeedProfile.sowingNotes ||
            selectedSeedProfile.experience ||
            selectedSeedProfile.profileNotes) && (
            <div className="seed-profile-summary-notes">
              {selectedSeedProfile.sowingDepthNote && (
                <p>
                  <strong>Hinweis zur Aussaattiefe:</strong>{" "}
                  {selectedSeedProfile.sowingDepthNote}
                </p>
              )}

              {selectedSeedProfile.sowingNotes && (
                <p>
                  <strong>Aussaat-Hinweise:</strong>{" "}
                  {selectedSeedProfile.sowingNotes}
                </p>
              )}

              {selectedSeedProfile.experience && (
                <p>
                  <strong>Erfahrungen:</strong> {selectedSeedProfile.experience}
                </p>
              )}

              {selectedSeedProfile.profileNotes && (
                <p>
                  <strong>Bemerkungen:</strong>{" "}
                  {selectedSeedProfile.profileNotes}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      <PotForm
        formData={formData}
        handleFormChange={handleFormChange}
        formError={formError}
        editingPotId={editingPotId}
        handleAddPot={handleSaveAndGoBack}
      />
    </div>
  );
}

export default PotFormPage;
