import { Link } from "react-router-dom";
import PotCard from "../components/PotCard";
import PotForm from "../components/PotForm";

function HomePage({
  formData,
  handleFormChange,
  handleAddPot,
  formError,
  editingPotId,
  statusFilter,
  setStatusFilter,
  filteredPots,
  selectedLabelIds,
  handleToggleLabelSelection,
}) {
  return (
    <div className="container">
      <h1>Pflanzen App 🌱</h1>
      <p>Meine ersten Töpfe</p>

      <PotForm
        formData={formData}
        handleFormChange={handleFormChange}
        handleAddPot={handleAddPot}
        formError={formError}
        editingPotId={editingPotId}
      />

      <div className="filter-bar">
        <button
          className={`button ${statusFilter === "all" ? "filter-active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          Alle
        </button>

        <button
          className={`button ${statusFilter === "active" ? "filter-active" : ""}`}
          onClick={() => setStatusFilter("active")}
        >
          Belegt
        </button>

        <button
          className={`button ${statusFilter === "empty" ? "filter-active" : ""}`}
          onClick={() => setStatusFilter("empty")}
        >
          Leer
        </button>
        <button className="button" disabled={selectedLabelIds.length === 0}>
          Etiketten drucken
        </button>
        {selectedLabelIds.length === 0 && (
          <p>
            Bitte zuerst mindestens einen Topf für den Etikettendruck auswählen.
          </p>
        )}
      </div>

      {filteredPots.length === 0 && (
        <p>Für den aktuellen Filter sind keine Töpfe vorhanden.</p>
      )}
      <p>
        Für Etikettendruck ausgewählt:{" "}
        <strong>{selectedLabelIds.length}</strong>
      </p>

      {filteredPots.map((pot) => (
        <div key={pot.id} className="label-selected-row">
          <label className="label-selected-checkbox">
            {" "}
            <input
              type="checkbox"
              checked={selectedLabelIds.includes(pot.id)}
              onChange={() => handleToggleLabelSelection(pot.id)}
            />
            Etikett auswählen
          </label>

          <Link
            to={`/pot/${pot.id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "block",
            }}
          >
            <PotCard
              id={pot.id}
              plantName={pot.plantName}
              sowingDate={pot.sowingDate}
              status={pot.status}
              isSelected={false}
            />
          </Link>
        </div>
      ))}
    </div>
  );
}

export default HomePage;
