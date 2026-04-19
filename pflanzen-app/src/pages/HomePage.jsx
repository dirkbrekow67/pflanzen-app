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
      </div>

      {filteredPots.length === 0 && (
        <p>Für den aktuellen Filter sind keine Töpfe vorhanden.</p>
      )}

      {filteredPots.map((pot) => (
        <Link
          key={pot.id}
          to={`/pot/${pot.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <PotCard
            id={pot.id}
            plantName={pot.plantName}
            sowingDate={pot.sowingDate}
            status={pot.status}
            isSelected={false}
          />
        </Link>
      ))}
    </div>
  );
}

export default HomePage;
