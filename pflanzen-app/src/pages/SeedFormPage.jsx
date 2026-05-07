import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/appConfig";
import SeedForm from "../components/SeedForm";

function SeedFormPage({
  newSeedProfile,
  handleSeedProfileChange,
  handleAddSeedProfile,
  editingSeedProfileId,
  formError,
  loadSeedProfilePhotos,
}) {
  const navigate = useNavigate();

  const [seedPhotoType, setSeedPhotoType] = useState("pack_front");
  const [seedPhotoMessage, setSeedPhotoMessage] = useState("");
  const [seedPhotos, setSeedPhotos] = useState([]);
  const { seedProfileId } = useParams();

  const currentSeedProfileId = editingSeedProfileId || seedProfileId;

  useEffect(() => {
    if (!currentSeedProfileId) {
      setSeedPhotos([]);
      return;
    }

    fetch(`${API_BASE_URL}/api/seed-profile-photos/${currentSeedProfileId}`)
      .then((res) => res.json())
      .then((data) => setSeedPhotos(data))
      .catch((err) => console.error("Samenprofil-Fotos Fehler:", err));
  }, [currentSeedProfileId]);

  async function handleSaveAndGoBack() {
    const success = await handleAddSeedProfile();

    if (success) {
      navigate("/seeds");
    }
  }

  async function handleSeedPhotoUpload(event) {
    const file = event.target.files[0];
    event.target.value = null;

    if (!file || !currentSeedProfileId) return;

    setSeedPhotoMessage("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("seedProfileId", currentSeedProfileId);
    formData.append("photoType", seedPhotoType);

    try {
      const response = await fetch(`${API_BASE_URL}/api/seed-profile-photos`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload fehlgeschlagen");
      }

      setSeedPhotoMessage("Packungsfoto wurde gespeichert.");

      loadSeedProfilePhotos();

      fetch(`${API_BASE_URL}/api/seed-profile-photos/${currentSeedProfileId}`)
        .then((res) => res.json())
        .then((data) => setSeedPhotos(data))
        .catch((err) => console.error("Samenprofil-Fotos Fehler:", err));
    } catch (error) {
      console.error("Samenprofil-Foto Upload Fehler:", error);
      setSeedPhotoMessage("Packungsfoto konnte nicht gespeichert werden.");
    }
  }

  async function handleDeleteSeedPhoto(photoId) {
    const confirmed = window.confirm("Packungsfoto wirklich löschen?");

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/seed-profile-photos/${photoId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Löschen fehlgeschlagen");
      }

      setSeedPhotoMessage("Packungsfoto wurde gelöscht.");

      loadSeedProfilePhotos();

      fetch(`${API_BASE_URL}/api/seed-profile-photos/${currentSeedProfileId}`)
        .then((res) => res.json())
        .then((data) => setSeedPhotos(data))
        .catch((err) => console.error("Samenprofil-Fotos Fehler:", err));
    } catch (error) {
      console.error("Samenprofil-Foto Löschen Fehler:", error);
      setSeedPhotoMessage("Packungsfoto konnte nicht gelöscht werden.");
    }
  }

  async function handleStartOcr(photoId) {
    setSeedPhotoMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/seed-profile-photos/${photoId}/ocr`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "OCR konnte nicht gestartet werden");
      }

      setSeedPhotoMessage("OCR-Verarbeitung wurde vorbereitet.");

      fetch(`${API_BASE_URL}/api/seed-profile-photos/${currentSeedProfileId}`)
        .then((res) => res.json())
        .then((data) => setSeedPhotos(data))
        .catch((err) => console.error("Samenprofil-Fotos Fehler:", err));

      loadSeedProfilePhotos();
    } catch (error) {
      console.error("OCR Fehler:", error);
      setSeedPhotoMessage("OCR konnte nicht gestartet werden.");
    }
  }

  return (
    <div className="container">
      <h1>Samenprofil anlegen / bearbeiten</h1>

      <div className="page-actions">
        <Link to="/seeds" className="button-link">
          ← Zur Samenbibliothek
        </Link>
      </div>

      <SeedForm
        formData={newSeedProfile}
        handleFormChange={handleSeedProfileChange}
        handleSubmit={handleSaveAndGoBack}
        editingId={currentSeedProfileId}
        formError={formError}
      />

      {currentSeedProfileId ? (
        <div className="photo-upload">
          <p className="hint">
            Optional: Foto der Samenpackung aufnehmen oder hochladen.
          </p>

          <p className="hint">
            Fotos der Samenpackung (Vorder- und Rückseite) können später
            automatisch zur Datenerkennung genutzt werden.
          </p>

          <div className="photo-type-select">
            <label>Packungsseite</label>
            <select
              value={seedPhotoType}
              onChange={(e) => setSeedPhotoType(e.target.value)}
            >
              <option value="pack_front">Vorderseite</option>
              <option value="pack_back">Rückseite</option>
            </select>
          </div>

          <label className="button-link photo-upload-button">
            Packungsfoto aufnehmen / hochladen
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleSeedPhotoUpload}
              hidden
              disabled={!currentSeedProfileId}
            />
          </label>

          {seedPhotoMessage && (
            <p className="photo-message">{seedPhotoMessage}</p>
          )}
        </div>
      ) : (
        <div className="photo-upload">
          <p className="hint">
            Packungsfotos können nach dem ersten Speichern des Samenprofils
            ergänzt werden. Sie können später automatisch zur Datenerkennung
            genutzt werden.
          </p>
        </div>
      )}

      {seedPhotos.length > 0 && (
        <div className="photo-gallery">
          <h2>Packungsfotos</h2>

          <div className="photo-grid">
            {[...seedPhotos]

              .sort((a, b) => {
                if (a.photoType === b.photoType) return 0;

                if (a.photoType === "pack_front") return -1;

                if (b.photoType === "pack_front") return 1;

                return 0;
              })
              .map((photo) => (
                <div key={photo.id} className="photo-card">
                  <img
                    src={`${API_BASE_URL}/uploads/${photo.fileName}`}
                    alt={photo.originalName || "Samenpackung"}
                  />

                  <p className="photo-date">
                    Hochgeladen am{" "}
                    {photo.uploadedAt
                      ? new Date(photo.uploadedAt).toLocaleDateString("de-DE")
                      : "-"}
                  </p>

                  <p>
                    {photo.photoType === "pack_back"
                      ? "Rückseite"
                      : "Vorderseite"}
                  </p>
                  <button
                    type="button"
                    className="button photo-delete-button"
                    onClick={() => handleDeleteSeedPhoto(photo.id)}
                  >
                    Foto löschen
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
      {currentSeedProfileId && seedPhotos.length > 0 && (
        <div className="photo-gallery">
          <h2>Daten aus Packungsfoto erkennen</h2>

          <p className="hint">
            Später können hier die Angaben der Samenpackung aus Vorder- und
            Rückseite ausgelesen und als Vorschläge in das Formular übernommen
            werden.
          </p>

          <button
            type="button"
            className="button"
            onClick={() => handleStartOcr(seedPhotos[0].id)}
          >
            Daten aus erstem Foto erkennen
          </button>

          <p className="hint">
            Die echte Texterkennung folgt später. Aktuell wird nur der
            OCR-Status vorbereitet.
          </p>
        </div>
      )}
    </div>
  );
}

export default SeedFormPage;
