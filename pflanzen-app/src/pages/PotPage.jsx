import { Link, useParams } from "react-router-dom";
import PotDetails from "../components/PotDetails";

function PotPage({ pots, handleEditPot, handleClearPot }) {
  const { potId } = useParams();

  // Sucht anhand der URL den passenden Topf aus der Liste
  const selectedPot = pots.find((pot) => pot.id === potId);

  return (
    <div className="container">
      <h1>Pflanzen App 🌱</h1>

      <div style={{ marginBottom: "20px" }}>
        <Link to="/" className="button-link">
          ← Zur Übersicht
        </Link>
      </div>

      {!selectedPot ? (
        <p>Der angeforderte Topf wurde nicht gefunden.</p>
      ) : (
        <PotDetails
          pot={selectedPot}
          onEditPot={handleEditPot}
          onClearPot={handleClearPot}
        />
      )}
    </div>
  );
}

export default PotPage;
