import { Link, useNavigate } from "react-router-dom";
import { monthLabels } from "../constants/months";
import { formatLifecycle, formatProfileStatus } from "../utils/formatHelpers";

function SeedLibraryPage({
  seedProfiles,
  handleEditSeedProfile,
  handleCreateNewSeedProfile,
  seedFilter,
  setSeedFilter,
  seedSearch,
  setSeedSearch,
  seedSort,
  setSeedSort,
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

      <div className="seed-search">
        <input
          type="text"
          value={seedSearch}
          onChange={(e) => setSeedSearch(e.target.value)}
          placeholder="Samenprofile suchen..."
        />
      </div>
      <div className="seed-sort">
        <label>Sortierung</label>
        <select value={seedSort} onChange={(e) => setSeedSort(e.target.value)}>
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="status">Status</option>
        </select>
      </div>

      <div className="seed-grid">
        {seedProfiles.map((profile) => (
          <div
            key={profile.id}
            className={`seed-card ${
              profile.profileStatus === "nicht-brauchbar"
                ? "profile-inactive"
                : ""
            }`}
          >
            <div className="seed-card-header">
              <div>
                <h3 className="seed-title">
                  {profile.plantName || "-"}
                  {profile.variety ? ` – ${profile.variety}` : ""}
                </h3>

                <p className="seed-meta">
                  {profile.manufacturer || "Unbekannt"} ·{" "}
                  {formatLifecycle(profile.lifecycle)}
                </p>
              </div>

              <span
                className={`seed-status ${profile.profileStatus || "testen"}`}
              >
                {formatProfileStatus(profile.profileStatus)}
              </span>
            </div>

            <div className="seed-card-body">
              <p>
                <strong>Aussaat:</strong> {monthLabels[profile.sowingFromMonth]}{" "}
                bis {monthLabels[profile.sowingToMonth]}
              </p>

              <p>
                <strong>Keimung:</strong> {profile.germinationDaysMin} bis{" "}
                {profile.germinationDaysMax} Tage bei{" "}
                {profile.germinationTempMin} bis {profile.germinationTempMax} °C
              </p>

              <p>
                <strong>Tiefe:</strong> {profile.sowingDepthCm} cm
              </p>

              <p>
                <strong>Nach draußen:</strong>{" "}
                {monthLabels[profile.outdoorFromMonth]} bis{" "}
                {monthLabels[profile.outdoorToMonth]}
              </p>

              {(profile.experience || profile.profileNotes) && (
                <p>
                  <strong>Notiz:</strong>{" "}
                  {profile.experience || profile.profileNotes || "-"}
                </p>
              )}

              <p className="seed-id">ID: {profile.id}</p>
            </div>

            <div className="seed-card-actions">
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
    </div>
  );
}

export default SeedLibraryPage;
