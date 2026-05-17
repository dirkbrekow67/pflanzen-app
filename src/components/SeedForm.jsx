import { useState } from "react";
import { months } from "../constants/months";

function SeedForm({
  formData,
  handleFormChange,
  handleSubmit,
  handleSubmitAndGoBack,
  editingId,
  formError,
}) {
  const [showSowingDetails, setShowSowingDetails] = useState(false);

  const [showEvaluationDetails, setShowEvaluationDetails] = useState(false);

  return (
    <div className="card seed-form-card">
      <div className="form-header-row">
        <div>
          <h2>{editingId ? "Samenprofil bearbeiten" : "Neues Samenprofil"}</h2>
          <p className="form-subtitle">
            Stammdaten, Aussaatangaben, Keimbedingungen und eigene Erfahrungen
            zum Samenprofil.
          </p>
        </div>

        {editingId && <span className="pot-profile-badge">{editingId}</span>}
      </div>

      {formError && <p className="error-box">{formError}</p>}

      <div className="form-grid">
        <section className="form-section-card">
          <h3>Grunddaten</h3>

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
              value={formData.variety || ""}
              onChange={(e) => handleFormChange("variety", e.target.value)}
            />
          </div>

          <div className="form-inline-grid">
            <div className="form-field">
              <label>Hersteller</label>
              <input
                value={formData.manufacturer || ""}
                onChange={(e) =>
                  handleFormChange("manufacturer", e.target.value)
                }
              />
            </div>

            <div className="form-field">
              <label>Händler</label>
              <input
                value={formData.retailer || ""}
                onChange={(e) => handleFormChange("retailer", e.target.value)}
              />
            </div>
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
        </section>

        <section className="form-section-card">
          <h3>Keimung</h3>

          <div className="form-inline-grid">
            <div className="form-field">
              <label>Temperatur min (°C)</label>
              <input
                type="number"
                value={formData.germinationTempMin}
                onChange={(e) =>
                  handleFormChange("germinationTempMin", e.target.value)
                }
              />
            </div>

            <div className="form-field">
              <label>Temperatur max (°C)</label>
              <input
                type="number"
                value={formData.germinationTempMax}
                onChange={(e) =>
                  handleFormChange("germinationTempMax", e.target.value)
                }
              />
            </div>

            <div className="form-field">
              <label>Dauer min (Tage)</label>
              <input
                type="number"
                value={formData.germinationDaysMin}
                onChange={(e) =>
                  handleFormChange("germinationDaysMin", e.target.value)
                }
              />
            </div>

            <div className="form-field">
              <label>Dauer max (Tage)</label>
              <input
                type="number"
                value={formData.germinationDaysMax}
                onChange={(e) =>
                  handleFormChange("germinationDaysMax", e.target.value)
                }
              />
            </div>
          </div>
        </section>

        {/* Aussaat */}
        <section className="form-section-card">
          <h3>Aussaat</h3>

          <div className="form-inline-grid">
            <div className="form-field">
              <label>Aussaattiefe (cm)</label>
              <input
                type="number"
                value={formData.sowingDepthCm}
                onChange={(e) =>
                  handleFormChange("sowingDepthCm", e.target.value)
                }
              />
            </div>

            <div className="form-field">
              <label>Aussaat von</label>
              <select
                value={formData.sowingFromMonth ?? ""}
                onChange={(e) =>
                  handleFormChange(
                    "sowingFromMonth",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              >
                <option value="">Bitte auswählen</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Aussaat bis</label>
              <select
                value={formData.sowingToMonth ?? ""}
                onChange={(e) =>
                  handleFormChange(
                    "sowingToMonth",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              >
                <option value="">Bitte auswählen</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            className="button button-compact"
            onClick={() => setShowSowingDetails((current) => !current)}
          >
            {showSowingDetails
              ? "Aussaat-Zusatzdaten ausblenden"
              : "Aussaat-Zusatzdaten anzeigen"}
          </button>

          {showSowingDetails && (
            <div className="form-extra-area">
              <div className="form-inline-grid">
                <div className="form-field">
                  <label>Reihenabstand (cm)</label>
                  <input
                    type="number"
                    value={formData.rowSpacingCm || ""}
                    onChange={(e) =>
                      handleFormChange("rowSpacingCm", e.target.value)
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Pflanzenabstand (cm)</label>
                  <input
                    type="number"
                    value={formData.plantSpacingCm || ""}
                    onChange={(e) =>
                      handleFormChange("plantSpacingCm", e.target.value)
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Aussaatbreite (cm)</label>
                  <input
                    type="number"
                    value={formData.sowingWidthCm || ""}
                    onChange={(e) =>
                      handleFormChange("sowingWidthCm", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="sowingDepthNote">Hinweis zur Aussaat</label>
                <input
                  type="text"
                  id="sowingDepthNote"
                  value={formData.sowingDepthNote || ""}
                  onChange={(e) =>
                    handleFormChange("sowingDepthNote", e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Weitere Hinweise zur Aussaat</label>
                <textarea
                  value={formData.sowingNotes || ""}
                  onChange={(e) =>
                    handleFormChange("sowingNotes", e.target.value)
                  }
                />
              </div>
            </div>
          )}
        </section>

        <section className="form-section-card">
          <h3>Nach draußen</h3>

          <div className="form-inline-grid">
            <div className="form-field">
              <label>Von</label>
              <select
                value={formData.outdoorFromMonth ?? ""}
                onChange={(e) =>
                  handleFormChange(
                    "outdoorFromMonth",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              >
                <option value="">Bitte auswählen</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Bis</label>
              <select
                value={formData.outdoorToMonth ?? ""}
                onChange={(e) =>
                  handleFormChange(
                    "outdoorToMonth",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              >
                <option value="">Bitte auswählen</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="form-section-card">
          <h3>Ernte</h3>

          <div className="form-inline-grid">
            <div className="form-field">
              <label>Von</label>
              <select
                value={formData.harvestFromMonth || ""}
                onChange={(e) =>
                  handleFormChange(
                    "harvestFromMonth",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
              >
                <option value="">Bitte auswählen</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Bis</label>
              <select
                value={formData.harvestToMonth || ""}
                onChange={(e) =>
                  handleFormChange(
                    "harvestToMonth",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
              >
                <option value="">Bitte auswählen</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Bewertung */}
        <section className="form-section-card form-section-wide">
          <div className="form-section-header-row">
            <h3>Bewertung</h3>

            <button
              type="button"
              className="button button-compact"
              onClick={() => setShowEvaluationDetails((current) => !current)}
            >
              {showEvaluationDetails ? "Ausblenden" : "Anzeigen"}
            </button>
          </div>

          {!showEvaluationDetails && (
            <p className="form-muted-text">
              Status, Erfahrungen und Bemerkungen sind eingeklappt.
            </p>
          )}

          {showEvaluationDetails && (
            <div className="form-extra-area">
              <div className="form-field">
                <label>Status</label>
                <select
                  value={formData.profileStatus}
                  onChange={(e) =>
                    handleFormChange("profileStatus", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleFormChange("experience", e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>Bemerkungen</label>
                <textarea
                  value={formData.profileNotes}
                  onChange={(e) =>
                    handleFormChange("profileNotes", e.target.value)
                  }
                />
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="form-actions">
        <button className="button" onClick={handleSubmit}>
          {editingId ? "Speichern" : "Anlegen"}
        </button>

        {editingId && handleSubmitAndGoBack && (
          <button
            className="button button-secondary"
            onClick={handleSubmitAndGoBack}
          >
            Speichern und zur Übersicht
          </button>
        )}
      </div>
    </div>
  );
}

export default SeedForm;
