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
  newSeedProfile,
  handleSeedProfileChange,
  handleAddSeedProfile,
}) {
  return (
    <div className="container">
      <h1>Samenbibliothek 🌿</h1>
      <p>Gespeicherte Pflanzen-Stammdaten</p>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Neues Samenprofil anlegen</h2>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Pflanzenname
          </label>
          <input
            type="text"
            value={newSeedProfile.plantName}
            onChange={(e) =>
              handleSeedProfileChange("plantName", e.target.value)
            }
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>Sorte</label>
          <input
            type="text"
            value={newSeedProfile.variety}
            onChange={(e) => handleSeedProfileChange("variety", e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Hersteller
          </label>
          <input
            type="text"
            value={newSeedProfile.manufacturer}
            onChange={(e) =>
              handleSeedProfileChange("manufacturer", e.target.value)
            }
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Erfahrung
          </label>
          <textarea
            value={newSeedProfile.experience}
            onChange={(e) =>
              handleSeedProfileChange("experience", e.target.value)
            }
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Status
          </label>
          <select
            value={newSeedProfile.profileStatus}
            onChange={(e) =>
              handleSeedProfileChange("profileStatus", e.target.value)
            }
          >
            <option value="testen">Testen</option>
            <option value="wiederverwenden">Wiederverwenden</option>
            <option value="keimt-schlecht">Keimt schlecht</option>
            <option value="nicht-brauchbar">Nicht brauchbar</option>
          </select>
        </div>

        <button onClick={handleAddSeedProfile} className="button">
          Samenprofil speichern
        </button>
      </div>

      <h2>Vorhandene Samenprofile</h2>

      {seedProfiles.map((profile) => (
        <div key={profile.id} className="card-light">
          <h2 style={{ marginTop: 0 }}>
            {profile.plantName}
            {profile.variety ? ` – ${profile.variety}` : ""}
          </h2>

          <p>
            <strong>Hersteller:</strong> {profile.manufacturer || "-"}
          </p>

          <p>
            <strong>Status:</strong> {profile.profileStatus || "testen"}
          </p>

          <p>
            <strong>Erfahrung:</strong> {profile.experience || "-"}
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
        </div>
      ))}
    </div>
  );
}

export default SeedLibraryPage;
