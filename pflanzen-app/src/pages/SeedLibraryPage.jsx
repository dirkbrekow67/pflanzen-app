import { Link } from "react-router-dom";

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
  editingSeedProfileId,
  handleEditSeedProfile,
}) {
  return (
    <div className="container">
      <h1>Samenbibliothek 🌿</h1>

      <div style={{ marginBottom: "16px" }}>
        <Link to="/" className="button-link">
          ← Zur Hauptseite
        </Link>
      </div>

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
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Lebenszyklus
          </label>
          <select
            value={newSeedProfile.lifecycle}
            onChange={(e) =>
              handleSeedProfileChange("lifecycle", e.target.value)
            }
          >
            <option value="annual">Einjährig</option>
            <option value="biennial">Zweijährig</option>
            <option value="perennial">Mehrjährig</option>
          </select>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Aussaat laut Packung von
          </label>
          <select
            value={newSeedProfile.sowingFromMonth}
            onChange={(e) =>
              handleSeedProfileChange("sowingFromMonth", Number(e.target.value))
            }
          >
            {Object.entries(monthLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Aussaat laut Packung bis
          </label>
          <select
            value={newSeedProfile.sowingToMonth}
            onChange={(e) =>
              handleSeedProfileChange("sowingToMonth", Number(e.target.value))
            }
          >
            {Object.entries(monthLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Keimtemperatur min (°C)
          </label>
          <input
            type="number"
            value={newSeedProfile.germinationTempMin}
            onChange={(e) =>
              handleSeedProfileChange("germinationTempMin", e.target.value)
            }
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Keimtemperatur max (°C)
          </label>
          <input
            type="number"
            value={newSeedProfile.germinationTempMax}
            onChange={(e) =>
              handleSeedProfileChange("germinationTempMax", e.target.value)
            }
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Keimdauer min (Tage)
          </label>
          <input
            type="number"
            value={newSeedProfile.germinationDaysMin}
            onChange={(e) =>
              handleSeedProfileChange("germinationDaysMin", e.target.value)
            }
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Keimdauer max (Tage)
          </label>
          <input
            type="number"
            value={newSeedProfile.germinationDaysMax}
            onChange={(e) =>
              handleSeedProfileChange("germinationDaysMax", e.target.value)
            }
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Aussaattiefe (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={newSeedProfile.sowingDepthCm}
            onChange={(e) =>
              handleSeedProfileChange("sowingDepthCm", e.target.value)
            }
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Nach draußen stellen von
          </label>
          <select
            value={newSeedProfile.outdoorFromMonth}
            onChange={(e) =>
              handleSeedProfileChange(
                "outdoorFromMonth",
                Number(e.target.value),
              )
            }
          >
            {Object.entries(monthLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Nach draußen stellen bis
          </label>
          <select
            value={newSeedProfile.outdoorToMonth}
            onChange={(e) =>
              handleSeedProfileChange("outdoorToMonth", Number(e.target.value))
            }
          >
            {Object.entries(monthLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleAddSeedProfile} className="button">
          {editingSeedProfileId
            ? "Änderung speichern"
            : "Samenprofil speichern"}
        </button>
      </div>

      <h2>Vorhandene Samenprofile</h2>

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
              onClick={() => handleEditSeedProfile(profile)}
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
