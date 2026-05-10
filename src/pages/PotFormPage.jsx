import { Link, useNavigate } from "react-router-dom";
import PotForm from "../components/PotForm";

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
}) {
  const navigate = useNavigate();

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

      <section className="card">
        <h2>Samenprofil laden</h2>
        <p>
          Wähle ein Profil aus der Samenbibliothek und übernimm die Stammdaten
          ins Formular.
        </p>

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

        <button onClick={handleApplySeedProfile} className="button">
          Profil ins Formular übernehmen
        </button>
      </section>

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
