function PotCard({ id, plantName, sowingDate, status, onSelect, isSelected }) {
  return (
    <div
      onClick={onSelect}
      className={`pot-status-${status}`}
      style={{
        border: isSelected ? "3px solid darkgreen" : "2px dashed green",
        padding: "12px",
        marginBottom: "12px",
        borderRadius: "8px",
        backgroundColor:
          status === "empty"
            ? isSelected
              ? "#f3e8b5"
              : "#fff8dc"
            : isSelected
              ? "#dff5df"
              : "#f9f9f9",
        cursor: "pointer",
      }}
    >
      <h2
        style={{
          color: "green",
          marginTop: 0,
        }}
      >
        {id}
      </h2>
      <p>Pflanze: {plantName}</p>
      <p>Aussaatdatum: {sowingDate}</p>
      {/* Zeigt an, ob der Topf aktuell leer oder belegt ist */}
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
