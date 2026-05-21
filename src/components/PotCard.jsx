// src/components/PotCard.jsx

function PotCard({ id, plantName, sowingDate, status, onSelect, isSelected }) {
  const effectiveStatus = status === "empty" ? "empty" : "active";

  const statusLabel = effectiveStatus === "empty" ? "Frei" : "Belegt";

  return (
    <div
      onClick={onSelect}
      className={`pot-card ${effectiveStatus} ${isSelected ? "selected" : ""}`}
    >
      <div className="pot-card-header">
        <div>
          <h2 className="pot-title">{id}</h2>
          <p className="pot-card-plant">
            {status === "empty" ? "Letzte Pflanze" : "Pflanze"}:{" "}
            <strong>{plantName || "-"}</strong>
          </p>
        </div>
        <span className={`pot-status-badge ${effectiveStatus}`}>
          {statusLabel}
        </span>
      </div>
      <div className="pot-card-meta">
        <span>Aussaat: {sowingDate || "-"}</span>

        {isSelected && <span className="pot-selected-label">Ausgewählt</span>}
      </div>
    </div>
  );
}

export default PotCard;
