import { Link, useNavigate } from "react-router-dom";
import SeedForm from "../components/SeedForm";

function SeedFormPage({
  newSeedProfile,
  handleSeedProfileChange,
  handleAddSeedProfile,
  editingSeedProfileId,
  formError,
}) {
  const navigate = useNavigate();

  async function handleSaveAndGoBack() {
    const success = await handleAddSeedProfile();

    if (success) {
      navigate("/seeds");
    }
  }

  return (
    <div className="container">
      <h1>Samenprofil anlegen / bearbeiten</h1>

      <div className="page-actions">
        <Link to="/seeds" className="button-link">
          ← Zur Samenbibliothek
        </Link>
      </div>

      <SeedForm
        formData={newSeedProfile}
        handleFormChange={handleSeedProfileChange}
        handleSubmit={handleSaveAndGoBack}
        editingId={editingSeedProfileId}
        formError={formError}
      />
    </div>
  );
}

export default SeedFormPage;
