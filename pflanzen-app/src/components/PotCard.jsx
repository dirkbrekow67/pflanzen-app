function PotCard({ id, plantName, sowingDate, status, onSelect, isSelected }) {
  const effectiveStatus = status === "empty" ? "empty" : "active";

  return (
    <div
      onClick={onSelect}
      className={`pot-card ${effectiveStatus} ${isSelected ? "selected" : ""}`}
    >
      <h2 className="pot-title">{id}</h2>

      <p>
        {status === "empty" ? "Letzte Sorte" : "Pflanze"}: {plantName || "-"}
      </p>

      <p>Aussaatdatum: {sowingDate || "-"}</p>

      <p>Status: {status === "empty" ? "Leer" : "Belegt"}</p>

      {isSelected && (
        <p>
          <strong>Ausgewählt</strong>
        </p>
      )}
    </div>
  );
}

export default PotCard;
