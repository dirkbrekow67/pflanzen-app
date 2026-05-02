const months = [
  { label: "Januar", value: 1 },
  { label: "Februar", value: 2 },
  { label: "März", value: 3 },
  { label: "April", value: 4 },
  { label: "Mai", value: 5 },
  { label: "Juni", value: 6 },
  { label: "Juli", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "Oktober", value: 10 },
  { label: "November", value: 11 },
  { label: "Dezember", value: 12 },
];

function SeedForm({
  formData,
  handleFormChange,
  handleSubmit,
  editingId,
  formError,
}) {
  return (
    <div className="card">
      <h2>{editingId ? "Samenprofil bearbeiten" : "Neues Samenprofil"}</h2>

      {formError && <p className="error-box">{formError}</p>}

      {/* Grunddaten */}
      <div className="section">
        <h3 className="section-title">Grunddaten</h3>

        <div className="form-field">
          <label>Pflanzenname</label>
          <input
            value={formData.plantName}
            onChange={(e) => handleFormChange("plantName", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Sorte</label>
          <input
            value={formData.variety}
            onChange={(e) => handleFormChange("variety", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Hersteller</label>
          <input
            value={formData.manufacturer}
            onChange={(e) => handleFormChange("manufacturer", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Lebenszyklus</label>
          <select
            value={formData.lifecycle}
            onChange={(e) => handleFormChange("lifecycle", e.target.value)}
          >
            <option value="annual">Einjährig</option>
            <option value="biennial">Zweijährig</option>
            <option value="perennial">Mehrjährig</option>
          </select>
        </div>
      </div>

      {/* Keimung */}
      <div className="section">
        <h3 className="section-title">Keimung</h3>

        <div className="form-field">
          <label>Keimtemperatur min (°C)</label>
          <input
            type="number"
            value={formData.germinationTempMin}
            onChange={(e) =>
              handleFormChange("germinationTempMin", e.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label>Keimtemperatur max (°C)</label>
          <input
            type="number"
            value={formData.germinationTempMax}
            onChange={(e) =>
              handleFormChange("germinationTempMax", e.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label>Keimdauer min (Tage)</label>
          <input
            type="number"
            value={formData.germinationDaysMin}
            onChange={(e) =>
              handleFormChange("germinationDaysMin", e.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label>Keimdauer max (Tage)</label>
          <input
            type="number"
            value={formData.germinationDaysMax}
            onChange={(e) =>
              handleFormChange("germinationDaysMax", e.target.value)
            }
          />
        </div>
      </div>

      {/* Aussaat */}
      <div className="section">
        <h3 className="section-title">Aussaat</h3>

        <div className="form-field">
          <label>Aussaattiefe (cm)</label>
          <input
            type="number"
            value={formData.sowingDepthCm}
            onChange={(e) => handleFormChange("sowingDepthCm", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Aussaat laut Packung von</label>
          <select
            value={formData.sowingFromMonth}
            onChange={(e) =>
              handleFormChange("sowingFromMonth", Number(e.target.value))
            }
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Aussaat laut Packung bis</label>
          <select
            value={formData.sowingToMonth}
            onChange={(e) =>
              handleFormChange("sowingToMonth", Number(e.target.value))
            }
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Nach draußen */}
      <div className="section">
        <h3 className="section-title">Nach draußen</h3>

        <div className="form-field">
          <label>Nach draußen stellen von</label>
          <select
            value={formData.outdoorFromMonth}
            onChange={(e) =>
              handleFormChange("outdoorFromMonth", Number(e.target.value))
            }
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Nach draußen stellen bis</label>
          <select
            value={formData.outdoorToMonth}
            onChange={(e) =>
              handleFormChange("outdoorToMonth", Number(e.target.value))
            }
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bewertung */}
      <div className="section">
        <h3 className="section-title">Bewertung</h3>

        <div className="form-field">
          <label>Status</label>
          <select
            value={formData.profileStatus}
            onChange={(e) => handleFormChange("profileStatus", e.target.value)}
          >
            <option value="testen">Testen</option>
            <option value="wiederverwenden">Wiederverwenden</option>
            <option value="keimt-schlecht">Keimt schlecht</option>
            <option value="nicht-brauchbar">Nicht brauchbar</option>
          </select>
        </div>

        <div className="form-field">
          <label>Erfahrungen</label>
          <textarea
            value={formData.experience}
            onChange={(e) => handleFormChange("experience", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Bemerkungen</label>
          <textarea
            value={formData.profileNotes}
            onChange={(e) => handleFormChange("profileNotes", e.target.value)}
          />
        </div>
      </div>

      <button className="button" onClick={handleSubmit}>
        {editingId ? "Speichern" : "Anlegen"}
      </button>
    </div>
  );
}

export default SeedForm;
