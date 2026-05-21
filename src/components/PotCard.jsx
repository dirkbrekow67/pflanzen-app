// src/components/PotCard.jsx

function PotCard({
  id,
  plantName,
  sowingDate,
  status,
  prickedDate,
  sourcePotId,
  onSelect,
  isSelected,
}) {
  const effectiveStatus = status === "empty" ? "empty" : "active";

  const statusLabel = effectiveStatus === "empty" ? "Frei" : "Belegt";

  function formatDateGerman(value) {
    if (!value) return "";

    return new Date(value).toLocaleDateString("de-DE");
  }

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

        {prickedDate && (
          <span>Pikiert am: {formatDateGerman(prickedDate)}</span>
        )}

        {sourcePotId && <span>Aus: {sourcePotId}</span>}

        {isSelected && <span className="pot-selected-label">Ausgewählt</span>}
      </div>
    </div>
  );
}

export default PotCard;
