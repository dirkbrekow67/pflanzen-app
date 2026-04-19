import { Link, useNavigate, useParams } from "react-router-dom";
import PotDetails from "../components/PotDetails";

function PotPage({ pots, handleEditPot, handleClearPot }) {
  const { potId } = useParams();

  // Sucht anhand der URL den passenden Topf aus der Liste
  const selectedPot = pots.find((pot) => pot.id === potId);

  const navigate = useNavigate();

  // Lädt die Topfdaten ins Formular und wechselt zurück zur Übersichtsseite
  function handleEditAndGoBack() {
    if (!selectedPot) return;
    handleEditPot(selectedPot);
    navigate("/");
  }

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
          onEditPot={handleEditAndGoBack}
          onClearPot={handleClearPot}
        />
      )}
    </div>
  );
}

export default PotPage;
