import { months } from "../constants/months";

function PotForm({
  formData,
  handleFormChange,
  handleAddPot,
  formError,
  editingPotId,
}) {
  return (
    <div className="card">
      <h2>{editingPotId ? "Topf bearbeiten" : "Neuen Topf hinzufügen"}</h2>
      {formError && <p className="error-box">{formError}</p>}
      <div className="section">
        <h3 className="section-title">Grunddaten</h3>

        <div className="form-field">
          <label>Pflanzenname</label>
          <input
            type="text"
            value={formData.plantName}
            onChange={(e) => handleFormChange("plantName", e.target.value)}
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
          <label>Aussaatdatum</label>
          <input
            type="date"
            value={formData.sowingDate}
            onChange={(e) => handleFormChange("sowingDate", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Nachgesät am</label>
          <input
            type="date"
            value={formData.resowingDate}
            onChange={(e) => handleFormChange("resowingDate", e.target.value)}
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
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
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
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

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
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
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
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="section">
        <h3 className="section-title">Beobachtungen</h3>

        <div className="form-field">
          <label>Topfnotizen / Beobachtungen</label>
          <textarea
            value={formData.potNotes}
            onChange={(e) => handleFormChange("potNotes", e.target.value)}
          />
        </div>
      </div>
      <button onClick={handleAddPot} className="button">
        {editingPotId ? "Änderungen speichern" : "Hinzufügen"}
      </button>
    </div>
  );
}

export default PotForm;
