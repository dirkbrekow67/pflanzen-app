import { Link, useNavigate } from "react-router-dom";

const monthLabels = {
  1: "Januar",
  2: "Februar",
  3: "März",
  4: "April",
  5: "Mai",
  6: "Juni",
  7: "Juli",
  8: "August",
  9: "September",
  10: "Oktober",
  11: "November",
  12: "Dezember",
};

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

      <div style={{ marginBottom: "16px" }}>
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
          className={seedFilter === "all" ? "button active" : "button"}
          onClick={() => setSeedFilter("all")}
        >
          Alle
        </button>

        <button
          className={seedFilter === "active" ? "button active" : "button"}
          onClick={() => setSeedFilter("active")}
        >
          Aktiv
        </button>

        <button
          className={seedFilter === "inactive" ? "button active" : "button"}
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
          <h2
            style={{
              marginTop: 0,
              color: "#111",
              fontWeight: "700",
            }}
          >
            {profile.plantName}
            {profile.variety ? ` – ${profile.variety}` : ""}
          </h2>

          <p>
            <strong>Hersteller:</strong> {profile.manufacturer || "-"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {profile.profileStatus === "nicht-brauchbar"
              ? "Unbrauchbar"
              : profile.profileStatus === "keimt-schlecht"
                ? "Keimt schlecht"
                : profile.profileStatus === "wiederverwenden"
                  ? "Wiederverwenden"
                  : "Testen"}
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
            <strong>Lebenszyklus:</strong>{" "}
            {profile.lifecycle === "annual"
              ? "Einjährig"
              : profile.lifecycle === "biennial"
                ? "Zweijährig"
                : "Mehrjährig"}
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
          <div style={{ marginTop: "12px" }}>
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
