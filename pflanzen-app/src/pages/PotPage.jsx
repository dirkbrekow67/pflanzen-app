import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PotDetails from "../components/PotDetails";
import { API_BASE_URL } from "../utils/appConfig";

function PotPage({ pots, handleEditPot, handleClearPot }) {
  const [history, setHistory] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [photoType, setPhotoType] = useState("progress");
  const { potId } = useParams();

  // Sucht anhand der URL den passenden Topf aus der Liste
  const selectedPot = pots.find((pot) => pot.id === potId);

  const navigate = useNavigate();
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/pot-history/${potId}`)
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error("Historie Fehler:", err));
  }, [potId, pots]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/photos/${potId}`)
      .then((res) => res.json())
      .then((data) => setPhotos(data))
      .catch((err) => console.error("Fotos Fehler:", err));
  }, [potId]);

  // Lädt die Topfdaten ins Formular und wechselt zurück zur Übersichtsseite
  function handleEditAndGoBack() {
    if (!selectedPot) return;
    handleEditPot(selectedPot);
    navigate("/pots/new");
  }

  async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file || !selectedPot) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("potId", selectedPot.id);
    formData.append("photoType", photoType);

    try {
      const response = await fetch(`${API_BASE_URL}/api/photos`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload fehlgeschlagen");
      }

      console.log("Upload erfolgreich:", data);
      fetch(`${API_BASE_URL}/api/photos/${selectedPot.id}`)
        .then((res) => res.json())
        .then((data) => setPhotos(data))
        .catch((err) => console.error("Fotos Fehler:", err));
    } catch (error) {
      console.error("Upload Fehler:", error);
    }
  }

  return (
    <div className="container">
      <h1>{selectedPot ? `Topf ${selectedPot.id}` : "Topfdetails"}</h1>
      <div className="page-actions-large">
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

      {selectedPot && (
        <>
          <div className="photo-upload">
            <p className="hint">
              Optional: Foto aufnehmen oder hochladen. Es dient nur als Hilfe
              für die spätere Entwicklungskontrolle.
            </p>
            <div className="photo-type-select">
              <label>Fotoart</label>
              <select
                value={photoType}
                onChange={(e) => setPhotoType(e.target.value)}
              >
                <option value="sowing">Aussaat</option>
                <option value="germination">Keimkontrolle</option>
                <option value="outdoor">Nach draußen</option>
                <option value="progress">Entwicklung</option>
              </select>
            </div>

            <label className="button-link photo-upload-button">
              Foto aufnehmen / hochladen
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                hidden
              />
            </label>
          </div>

          {photos.length > 0 && (
            <div className="photo-gallery">
              <h2>Fotos</h2>

              <div className="photo-grid">
                {photos.map((photo) => (
                  <div key={photo.id} className="photo-card">
                    <img
                      src={`${API_BASE_URL}/uploads/${photo.fileName}`}
                      alt={photo.originalName || "Topf-Foto"}
                    />

                    <p className="photo-date">
                      Hochgeladen am{" "}
                      {photo.uploadedAt
                        ? new Date(photo.uploadedAt).toLocaleDateString("de-DE")
                        : "-"}
                    </p>

                    <p>
                      {photo.photoType === "sowing"
                        ? "Aussaat"
                        : photo.photoType === "germination"
                          ? "Keimkontrolle"
                          : photo.photoType === "outdoor"
                            ? "Nach draußen"
                            : "Entwicklung"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <h2 className="history-title">Verlauf</h2>
      {history.length === 0 ? (
        <p>Keine Historie vorhanden.</p>
      ) : (
        <div className="history-wrapper">
          {history.map((entry) => {
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
              <div key={entry.id} className="history-entry">
                <p>
                  <strong>{entry.plantName || "-"}</strong>
                </p>

                {entry.seedProfileId && (
                  <p>
                    <small>Samenprofil: {entry.seedProfileId}</small>
                  </p>
                )}

                <p>
                  {formatDate(entry.startedAt)} – {formatDate(entry.endedAt)}
                </p>

                <p>Standzeit: {days ? `${days} Tage` : "-"}</p>

                <p>
                  Grund: {entry.endReason}
                  {entry.endReasonNote && <span> ({entry.endReasonNote})</span>}
                </p>

                {entry.potNotes && (
                  <p>
                    <small>Notiz: {entry.potNotes}</small>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PotPage;
