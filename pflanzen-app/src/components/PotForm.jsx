function PotForm({
  newPlantName,
  setNewPlantName,
  newLifecycle,
  setNewLifecycle,
  newGerminationTempMin,
  setNewGerminationTempMin,
  newGerminationTempMax,
  setNewGerminationTempMax,
  newGerminationDaysMin,
  setNewGerminationDaysMin,
  newGerminationDaysMax,
  setNewGerminationDaysMax,
  newSowingDepthCm,
  setNewSowingDepthCm,
  newSowingDate,
  setNewSowingDate,
  handleAddPot,
}) {
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
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ marginBottom: "8px" }}>Grunddaten</h3>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Pflanzenname
          </label>
          <input
            type="text"
            value={newPlantName}
            onChange={(e) => setNewPlantName(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Lebenszyklus
          </label>
          <select
            value={newLifecycle}
            onChange={(e) => setNewLifecycle(e.target.value)}
          >
            <option value="annual">Einjährig</option>
            <option value="biennial">Zweijährig</option>
            <option value="perennial">Mehrjährig</option>
          </select>
        </div>
      </div>
      <div style={{ marginTop: "12px" }}>
        <h3 style={{ marginBottom: "8px" }}>Keimung</h3>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Keimtemperatur min (°C)
          </label>
          <input
            type="number"
            value={newGerminationTempMin}
            onChange={(e) => setNewGerminationTempMin(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Keimtemperatur max (°C)
          </label>
          <input
            type="number"
            value={newGerminationTempMax}
            onChange={(e) => setNewGerminationTempMax(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Keimdauer min (Tage)
          </label>
          <input
            type="number"
            value={newGerminationDaysMin}
            onChange={(e) => setNewGerminationDaysMin(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Keimdauer max (Tage)
          </label>
          <input
            type="number"
            value={newGerminationDaysMax}
            onChange={(e) => setNewGerminationDaysMax(e.target.value)}
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
            value={newSowingDepthCm}
            onChange={(e) => setNewSowingDepthCm(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Aussaatdatum
          </label>
          <input
            type="date"
            value={newSowingDate}
            onChange={(e) => setNewSowingDate(e.target.value)}
          />
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
