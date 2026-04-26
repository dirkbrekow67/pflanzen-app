import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PotDetails from "../components/PotDetails";

function PotPage({ pots, handleEditPot, handleClearPot }) {
  const [history, setHistory] = useState([]);
  const { potId } = useParams();

  // Sucht anhand der URL den passenden Topf aus der Liste
  const selectedPot = pots.find((pot) => pot.id === potId);

  const navigate = useNavigate();
  useEffect(() => {
    fetch(`http://localhost:3001/api/pot-history/${potId}`)
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error("Historie Fehler:", err));
  }, [potId, pots]);

  // Lädt die Topfdaten ins Formular und wechselt zurück zur Übersichtsseite
  function handleEditAndGoBack() {
    if (!selectedPot) return;
    handleEditPot(selectedPot);
    navigate("/");
  }

  return (
    <div className="container">
      <h1>{selectedPot ? `Topf ${selectedPot.id}` : "Topfdetails"}</h1>

      <div style={{ marginBottom: "20px" }}>
        <Link to="/" className="button-link">
          ← Zur Übersicht
        </Link>
      </div>

      {!selectedPot ? (
        <div className="card-light">
          <h2>Topf nicht gefunden</h2>
          <p>Der angeforderte Topf existiert nicht oder wurde entfernt.</p>

          <Link to="/" className="button-link">
            Zur Übersicht
          </Link>
        </div>
      ) : (
        <PotDetails
          pot={selectedPot}
          onEditPot={handleEditAndGoBack}
          onClearPot={handleClearPot}
        />
      )}
      <h2>Verlauf</h2>

      {history.length === 0 ? (
        <p>Keine Historie vorhanden.</p>
      ) : (
        history.map((entry) => {
          const start = entry.startedAt ? new Date(entry.startedAt) : null;

          const end = entry.endedAt ? new Date(entry.endedAt) : null;

          const days =
            start && end
              ? Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
              : null;

          const formatDate = (dateString) => {
            if (!dateString) return "-";

            return new Date(dateString).toLocaleDateString("de-DE");
          };

          return (
            <div key={entry.id} className="card-light">
              <p>
                <strong>{entry.plantName || "-"}</strong>
              </p>

              <p>
                {formatDate(entry.startedAt)} – {formatDate(entry.endedAt)}
              </p>

              <p>Standzeit: {days ? `${days} Tage` : "-"}</p>

              <p>
                Grund: {entry.endReason}
                {entry.endReasonNote && <span> ({entry.endReasonNote})</span>}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}

export default PotPage;
