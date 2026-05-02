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

  function handleSaveAndGoBack() {
    handleAddSeedProfile();
    navigate("/seeds");
  }

  return (
    <div className="container">
      <h1>Samenprofil anlegen / bearbeiten</h1>

      <div style={{ marginBottom: "16px" }}>
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
