import { Link, useNavigate } from "react-router-dom";
import { monthLabels } from "../constants/months";
import { formatLifecycle, formatProfileStatus } from "../utils/formatHelpers";

function SeedLibraryPage({
  seedProfiles,
  handleEditSeedProfile,
  handleCreateNewSeedProfile,
  seedFilter,
  setSeedFilter,
}) {
  const navigate = useNavigate();

  function handleEditAndOpenForm(profile) {
    handleEditSeedProfile(profile);
    navigate("/seeds/new");
  }

  return (
    <div className="container">
      <h1>Samenbibliothek 🌿</h1>

      <div className="page-actions">
        <Link to="/" className="button-link">
          ← Zur Hauptseite
        </Link>
      </div>

      <p>Gespeicherte Pflanzen-Stammdaten</p>
      <button
        onClick={() => {
          handleCreateNewSeedProfile();
          navigate("/seeds/new");
        }}
        className="button"
      >
        Neues Samenprofil anlegen
      </button>
      <h2>Vorhandene Samenprofile</h2>

      <div className="filter-bar">
        <button
          className={seedFilter === "all" ? "button filter-active" : "button"}
          onClick={() => setSeedFilter("all")}
        >
          Alle
        </button>

        <button
          className={
            seedFilter === "active" ? "button filter-active" : "button"
          }
          onClick={() => setSeedFilter("active")}
        >
          Aktiv
        </button>

        <button
          className={
            seedFilter === "inactive" ? "button filter-active" : "button"
          }
          onClick={() => setSeedFilter("inactive")}
        >
          Inaktiv
        </button>
      </div>

      {seedProfiles.map((profile) => (
        <div
          key={profile.id}
          className={`card-light ${
            profile.profileStatus === "nicht-brauchbar"
              ? "profile-inactive"
              : ""
          }`}
        >
          <h2 className="card-title">
            {profile.plantName}
            {profile.variety ? ` – ${profile.variety}` : ""}
          </h2>

          <p>
            <strong>Hersteller:</strong> {profile.manufacturer || "-"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {formatProfileStatus(profile.profileStatus)}
          </p>

          <p>
            <strong>Erfahrung:</strong> {profile.experience || "-"}
          </p>
          <p>
            <strong>Bemerkungen:</strong> {profile.profileNotes || "-"}
          </p>
          <p>
            <strong>ID:</strong> {profile.id}
          </p>

          <p>
            <strong>Lebenszyklus:</strong> {formatLifecycle(profile.lifecycle)}
          </p>

          <p>
            <strong>Aussaat laut Packung:</strong>{" "}
            {monthLabels[profile.sowingFromMonth]} bis{" "}
            {monthLabels[profile.sowingToMonth]}
          </p>

          <p>
            <strong>Keimtemperatur:</strong> {profile.germinationTempMin} bis{" "}
            {profile.germinationTempMax} °C
          </p>

          <p>
            <strong>Keimdauer:</strong> {profile.germinationDaysMin} bis{" "}
            {profile.germinationDaysMax} Tage
          </p>

          <p>
            <strong>Aussaattiefe:</strong> {profile.sowingDepthCm} cm
          </p>

          <p>
            <strong>Nach draußen:</strong>{" "}
            {monthLabels[profile.outdoorFromMonth]} bis{" "}
            {monthLabels[profile.outdoorToMonth]}
          </p>
          <div className="card-actions">
            <button
              onClick={() => handleEditAndOpenForm(profile)}
              className="button"
            >
              Bearbeiten
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SeedLibraryPage;
