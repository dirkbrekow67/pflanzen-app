// src/components/PotForm.jsx

import { useState } from "react";
import { months } from "../constants/months";

function PotForm({
  formData,
  handleFormChange,
  handleAddPot,
  formError,
  editingPotId,
}) {
  const [showSowingExtras, setShowSowingExtras] = useState(false);

  return (
    <div className="card pot-form-card">
      <div className="form-header-row">
        <div>
          <h2>{editingPotId ? "Topf bearbeiten" : "Neuen Topf hinzufügen"}</h2>
          <p className="form-subtitle">
            Aktuelle Belegung, Aussaatdaten und Beobachtungen zum Topf.
          </p>
        </div>

        {editingPotId && (
          <span className="pot-profile-badge">{editingPotId}</span>
        )}
      </div>

      {formError && <p className="error-box">{formError}</p>}

      <div className="form-grid">
        <section className="form-section-card">
          <h3>Grunddaten</h3>

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

        <section className="form-section-card">
          <div className="form-section-header-row">
            <h3>Aussaat</h3>

            <button
              type="button"
              className="button button-compact"
              onClick={() => setShowSowingExtras((current) => !current)}
            >
              {showSowingExtras ? "Zusatzdaten ausblenden" : "Zusatzdaten"}
            </button>
          </div>

          <div className="form-inline-grid">
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
                onChange={(e) =>
                  handleFormChange("resowingDate", e.target.value)
                }
              />
            </div>
          </div>

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
              <label>Profil-ID</label>
              <input
                type="text"
                value={formData.seedProfileId || ""}
                onChange={(e) =>
                  handleFormChange("seedProfileId", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-inline-grid">
            <div className="form-field">
              <label>Aussaat laut Packung von</label>
              <select
                value={formData.sowingFromMonth ?? ""}
                onChange={(e) =>
                  handleFormChange(
                    "sowingFromMonth",
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
              <label>Aussaat laut Packung bis</label>
              <select
                value={formData.sowingToMonth ?? ""}
                onChange={(e) =>
                  handleFormChange(
                    "sowingToMonth",
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

          {showSowingExtras && (
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
                <label>Hinweis zur Aussaat</label>
                <input
                  type="text"
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
                value={formData.outdoorToMonth ?? ""}
                onChange={(e) =>
                  handleFormChange(
                    "outdoorToMonth",
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

        <section className="form-section-card form-section-wide">
          <h3>Beobachtungen</h3>

          <div className="form-field">
            <label>Topfnotizen / Beobachtungen</label>
            <textarea
              value={formData.potNotes}
              onChange={(e) => handleFormChange("potNotes", e.target.value)}
            />
          </div>
        </section>
      </div>

      <div className="form-actions">
        <button onClick={handleAddPot} className="button">
          {editingPotId ? "Änderungen speichern" : "Hinzufügen"}
        </button>
      </div>
    </div>
  );
}

export default PotForm;
