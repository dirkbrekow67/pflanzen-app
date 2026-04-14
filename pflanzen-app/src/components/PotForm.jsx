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

function PotForm({ formData, handleFormChange, handleAddPot, formError }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "24px",
        backgroundColor: "#f7f7f7",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Neuen Topf hinzufügen</h2>
      {formError && (
        <p
          style={{
            color: "darkred",
            backgroundColor: "#ffe5e5",
            padding: "8px",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          {formError}
        </p>
      )}
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ marginBottom: "8px" }}>Grunddaten</h3>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Pflanzenname
          </label>
          <input
            type="text"
            value={formData.plantName}
            onChange={(e) => handleFormChange("plantName", e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Lebenszyklus
          </label>
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
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ marginBottom: "8px" }}>Keimung</h3>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Keimtemperatur min (°C)
          </label>
          <input
            type="number"
            value={formData.germinationTempMin}
            onChange={(e) =>
              handleFormChange("germinationTempMin", e.target.value)
            }
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Keimtemperatur max (°C)
          </label>
          <input
            type="number"
            value={formData.germinationTempMax}
            onChange={(e) =>
              handleFormChange("germinationTempMax", e.target.value)
            }
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Keimdauer min (Tage)
          </label>
          <input
            type="number"
            value={formData.germinationDaysMin}
            onChange={(e) =>
              handleFormChange("germinationDaysMin", e.target.value)
            }
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Keimdauer max (Tage)
          </label>
          <input
            type="number"
            value={formData.germinationDaysMax}
            onChange={(e) =>
              handleFormChange("germinationDaysMax", e.target.value)
            }
          />
        </div>
      </div>
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ marginBottom: "8px" }}>Aussaat</h3>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Aussaattiefe (cm)
          </label>
          <input
            type="number"
            value={formData.sowingDepthCm}
            onChange={(e) => handleFormChange("sowingDepthCm", e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Aussaatdatum
          </label>
          <input
            type="date"
            value={formData.sowingDate}
            onChange={(e) => handleFormChange("sowingDate", e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ marginBottom: "8px" }}>Nach Draussen</h3>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Nach draußen stellen von
          </label>
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

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Nach draussen stellen bis
          </label>
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

      <button
        onClick={handleAddPot}
        style={{
          padding: "10px 18px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Hinzufügen
      </button>
    </div>
  );
}

export default PotForm;
