// src/pages/PotPage.jsx

import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PotDetails from "../components/PotDetails";
import { API_BASE_URL } from "../utils/appConfig";

const photoTypeOptions = [
  { value: "sowing", label: "Aussaat" },
  { value: "germination", label: "Keimkontrolle" },
  { value: "before-pricking", label: "Vor dem Pikieren" },
  { value: "pricking", label: "Pikiert / nach dem Pikieren" },
  { value: "outdoor", label: "Nach draußen" },
  { value: "progress", label: "Entwicklung" },
];

function formatPhotoType(value) {
  return (
    photoTypeOptions.find((option) => option.value === value)?.label ||
    "Entwicklung"
  );
}

function formatHistoryReason(value) {
  if (value === "teilpikiert") return "Teilweise pikiert";
  if (value === "pikiert") return "Vollständig pikiert";
  if (value === "freigegeben") return "Freigegeben";
  if (value === "geerntet") return "Geerntet";
  if (value === "fehlgeschlagen") return "Fehlgeschlagen";
  if (value === "umgetopft") return "Umgetopft";
  if (value === "entsorgt") return "Entsorgt";
  if (value === "sonstiges") return "Sonstiges";

  return value || "-";
}

function isPrickingHistoryReason(value) {
  return value === "teilpikiert" || value === "pikiert";
}

function PotPage({
  pots,
  handleEditPot,
  handleClearPot,
  loadPots,
  loadReminders,
}) {
  const [history, setHistory] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [photoType, setPhotoType] = useState("progress");
  const [photoMessage, setPhotoMessage] = useState("");
  const [prickingMessage, setPrickingMessage] = useState("");
  const [showPrickingDialog, setShowPrickingDialog] = useState(false);
  const [prickingGuideSourcePotId, setPrickingGuideSourcePotId] = useState("");
  const [prickingDate, setPrickingDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [seedlingsCount, setSeedlingsCount] = useState("");
  const [selectedTargetPotIds, setSelectedTargetPotIds] = useState([]);
  const [confirmReleaseSourcePot, setConfirmReleaseSourcePot] = useState(false);
  const [prickingGuideTargetIds, setPrickingGuideTargetIds] = useState([]);
  const [prickingGuideIndex, setPrickingGuideIndex] = useState(0);
  const { potId } = useParams();

  // Sucht anhand der URL den passenden Topf aus der Liste
  const selectedPot = pots.find((pot) => pot.id === potId);

  const canPrickPot =
    selectedPot && selectedPot.status !== "empty" && !selectedPot.sourcePotId;

  const isPrickedTargetPot =
    selectedPot &&
    selectedPot.status !== "empty" &&
    Boolean(selectedPot.sourcePotId);

  const prickedTargetPots = selectedPot
    ? pots.filter(
        (pot) =>
          pot.sourcePotId === selectedPot.id &&
          (pot.status || "active") !== "empty",
      )
    : [];

  const currentGuideTargetId = prickingGuideTargetIds[prickingGuideIndex] || "";

  const currentGuideTargetPot = currentGuideTargetId
    ? pots.find((pot) => pot.id === currentGuideTargetId)
    : null;

  const hasActivePrickingGuide =
    prickingGuideTargetIds.length > 0 && Boolean(currentGuideTargetId);

  const isCurrentGuideTargetPage =
    hasActivePrickingGuide && selectedPot?.id === currentGuideTargetId;

  const nextGuideTargetId =
    prickingGuideTargetIds[prickingGuideIndex + 1] || "";

  const emptyTargetPots = pots.filter(
    (pot) => (pot.status || "active") === "empty" && pot.id !== potId,
  );

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
    navigate(`/pot/${selectedPot.id}/edit`);
  }

  function openPrickingDialog() {
    if (!selectedPot) return;

    setPrickingDate(new Date().toISOString().split("T")[0]);
    setSeedlingsCount(selectedPot.seedlingsCount || "");
    setSelectedTargetPotIds([]);
    setPrickingMessage("");
    setConfirmReleaseSourcePot(false);
    setShowPrickingDialog(true);
  }

  function closePrickingDialog() {
    setShowPrickingDialog(false);
    setSeedlingsCount("");
    setSelectedTargetPotIds([]);
    setPrickingMessage("");
    setConfirmReleaseSourcePot(false);
  }

  function toggleTargetPotSelection(targetPotId) {
    setSelectedTargetPotIds((currentIds) =>
      currentIds.includes(targetPotId)
        ? currentIds.filter((id) => id !== targetPotId)
        : [...currentIds, targetPotId],
    );
  }

  function openCurrentGuideTarget() {
    if (!currentGuideTargetId) return;

    setPhotoType("pricking");
    navigate(`/pot/${currentGuideTargetId}`);
  }

  function skipCurrentGuideTarget() {
    if (prickingGuideIndex + 1 >= prickingGuideTargetIds.length) {
      setPrickingGuideTargetIds([]);
      setPrickingGuideIndex(0);

      const sourcePotId = prickingGuideSourcePotId;

      setPrickingGuideSourcePotId("");

      if (sourcePotId) {
        navigate(`/pot/${sourcePotId}`);
      }

      return;
    }

    const nextIndex = prickingGuideIndex + 1;
    const nextTargetId = prickingGuideTargetIds[nextIndex];

    setPrickingGuideIndex(nextIndex);
    setPhotoType("pricking");

    if (nextTargetId) {
      navigate(`/pot/${nextTargetId}`);
    }
  }

  function stopPrickingGuide() {
    setPrickingGuideTargetIds([]);
    setPrickingGuideIndex(0);
    setPrickingGuideSourcePotId("");
  }

  async function handlePreparePricking() {
    if (!selectedPot) return;

    const totalSeedlings = Number(seedlingsCount);
    const targetCount = selectedTargetPotIds.length;

    if (!Number.isInteger(totalSeedlings) || totalSeedlings < 1) {
      setPrickingMessage("Bitte die Anzahl entstandener Pflanzen eintragen.");
      return;
    }

    if (targetCount === 0) {
      setPrickingMessage("Bitte mindestens einen freien Ziel-Topf auswählen.");
      return;
    }

    if (targetCount > totalSeedlings) {
      setPrickingMessage(
        "Es wurden mehr Ziel-Töpfe ausgewählt als entstandene Pflanzen vorhanden sind.",
      );
      return;
    }

    if (targetCount === totalSeedlings && !confirmReleaseSourcePot) {
      setPrickingMessage(
        "Alle entstandenen Pflanzen werden auf Ziel-Töpfe verteilt. Der Ursprungstopf würde dadurch freigegeben. Bitte bewusst bestätigen.",
      );
      return;
    }

    if (!prickingDate) {
      setPrickingMessage("Bitte ein Pikierdatum eintragen.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/pricking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourcePotId: selectedPot.id,
          targetPotIds: selectedTargetPotIds,
          prickingDate,
          totalSeedlings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Pikieren konnte nicht gespeichert werden.",
        );
      }

      loadPots();
      loadReminders();

      setShowPrickingDialog(false);
      setSelectedTargetPotIds([]);
      setConfirmReleaseSourcePot(false);
      setPrickingMessage("");
      setPhotoType("pricking");
      setPrickingGuideTargetIds(data.targetPotIds || selectedTargetPotIds);
      setPrickingGuideIndex(0);
      setPrickingGuideSourcePotId(selectedPot.id);

      setPhotoMessage(
        data.plantsRemainingInSourcePot === 0
          ? `Pikieren abgeschlossen: ${data.targetCount} Ziel-Topf/Topf(e) belegt, Ursprungstopf wurde freigegeben.`
          : `Pikieren vorbereitet: ${data.targetCount} Ziel-Topf/Topf(e) belegt, ${data.plantsRemainingInSourcePot} Pflanze(n) bleiben im Ursprungstopf.`,
      );
    } catch (error) {
      console.error("Fehler beim Pikieren:", error);
      setPrickingMessage(
        error.message || "Pikieren konnte nicht gespeichert werden.",
      );
    }
  }

  async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file || !selectedPot) return;

    setPhotoMessage("");

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
      setPhotoMessage("Foto wurde gespeichert.");

      if (hasActivePrickingGuide) {
        skipCurrentGuideTarget();
        return;
      }

      fetch(`${API_BASE_URL}/api/photos/${selectedPot.id}`)
        .then((res) => res.json())
        .then((data) => setPhotos(data))
        .catch((err) => console.error("Fotos Fehler:", err));
    } catch (error) {
      console.error("Upload Fehler:", error);
      setPhotoMessage("Foto konnte nicht gespeichert werden.");
    }
  }

  return (
    <div className="container">
      {showPrickingDialog && selectedPot && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Pikieren vorbereiten</h2>

            <p>
              Ursprungstopf: <strong>{selectedPot.id}</strong> –{" "}
              <strong>{selectedPot.plantName || "-"}</strong>
            </p>

            <div className="form-field">
              <label>Pikierdatum</label>
              <input
                type="date"
                value={prickingDate}
                onChange={(event) => setPrickingDate(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Entstandene Pflanzen insgesamt</label>
              <input
                type="number"
                min="0"
                step="1"
                value={seedlingsCount}
                onChange={(event) => setSeedlingsCount(event.target.value)}
                placeholder="z. B. 3"
              />
            </div>

            <div className="form-field">
              <label>Freie Ziel-Töpfe</label>

              {emptyTargetPots.length === 0 && (
                <p>Es sind aktuell keine freien Töpfe vorhanden.</p>
              )}

              {emptyTargetPots.length > 0 && (
                <div className="pricking-target-list">
                  {emptyTargetPots.map((targetPot) => (
                    <label key={targetPot.id} className="label-select-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedTargetPotIds.includes(targetPot.id)}
                        onChange={() => toggleTargetPotSelection(targetPot.id)}
                      />
                      {targetPot.id}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <p className="form-muted-text">
              Ausgewählte Ziel-Töpfe:{" "}
              <strong>{selectedTargetPotIds.length}</strong>
            </p>
            {Number(seedlingsCount) > 0 &&
              selectedTargetPotIds.length === Number(seedlingsCount) && (
                <label className="label-select-checkbox">
                  <input
                    type="checkbox"
                    checked={confirmReleaseSourcePot}
                    onChange={(event) =>
                      setConfirmReleaseSourcePot(event.target.checked)
                    }
                  />
                  Ursprungstopf nach dem Pikieren freigeben
                </label>
              )}
            {prickingMessage && <p className="error-box">{prickingMessage}</p>}

            <div className="filter-bar">
              <button
                type="button"
                className="button"
                disabled={selectedTargetPotIds.length === 0}
                onClick={handlePreparePricking}
              >
                {Number(seedlingsCount) > 0 &&
                selectedTargetPotIds.length === Number(seedlingsCount)
                  ? "Pikieren abschließen"
                  : "Pikieren vorbereiten"}
              </button>

              <button
                type="button"
                className="button"
                onClick={closePrickingDialog}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
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
        <>
          <PotDetails
            pot={selectedPot}
            onEditPot={handleEditAndGoBack}
            onClearPot={handleClearPot}
          />
          {canPrickPot && (
            <div className="card-light page-actions-large">
              <h2>Pikieren</h2>
              <p>
                Mehrere Jungpflanzen aus diesem Ursprungstopf können auf freie
                Ziel-Töpfe verteilt werden. Der Ursprungstopf bleibt dabei
                belegt.
              </p>

              <button
                type="button"
                className="button"
                onClick={openPrickingDialog}
              >
                Pikieren
              </button>
            </div>
          )}

          {prickedTargetPots.length > 0 && (
            <div className="card-light page-actions-large">
              <h2>Pikierte Ziel-Töpfe</h2>

              <p>
                Aus diesem Ursprungstopf wurden bereits folgende Ziel-Töpfe
                belegt:
              </p>

              <div className="pricked-target-list">
                {prickedTargetPots.map((targetPot) => (
                  <Link
                    key={targetPot.id}
                    to={`/pot/${targetPot.id}`}
                    className="pricked-target-card"
                  >
                    <strong>{targetPot.id}</strong>

                    <span>{targetPot.plantName || "-"}</span>

                    <small>
                      Pflanzen im Topf: {targetPot.plantsInPot || "-"}
                      {targetPot.prickedDate
                        ? ` · Pikiert am ${new Date(
                            targetPot.prickedDate,
                          ).toLocaleDateString("de-DE")}`
                        : ""}
                    </small>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {isPrickedTargetPot && (
            <div className="card-light page-actions-large">
              <h2>Pikiertes Ziel</h2>

              <p>
                Dieser Topf wurde bereits aus{" "}
                <strong>{selectedPot.sourcePotId}</strong> pikiert. Eine erneute
                Verteilung über den normalen Pikierdialog ist für diesen Topf
                nicht vorgesehen.
              </p>

              <div className="filter-bar">
                <Link
                  to={`/pot/${selectedPot.sourcePotId}`}
                  className="button-link"
                >
                  Ursprungstopf öffnen
                </Link>

                <Link to="/" className="button-link">
                  Zur Topfliste
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {selectedPot && hasActivePrickingGuide && (
        <div className="card-light page-actions-large">
          <h2>Nächster Schritt nach dem Pikieren</h2>

          <p>
            Ziel-Topf{" "}
            <strong>
              {prickingGuideIndex + 1} von {prickingGuideTargetIds.length}
            </strong>
            : <strong>{currentGuideTargetId}</strong>
          </p>

          <p>
            Öffne den Ziel-Topf, prüfe die Jungpflanze und mache bei Bedarf
            direkt ein Foto mit der Fotoart{" "}
            <strong>Pikiert / nach dem Pikieren</strong>. Du kannst den Schritt
            auch überspringen.
          </p>

          {currentGuideTargetPot && (
            <p className="form-muted-text">
              Pflanze: <strong>{currentGuideTargetPot.plantName || "-"}</strong>
            </p>
          )}

          <div className="filter-bar">
            {!isCurrentGuideTargetPage && (
              <button
                type="button"
                className="button"
                onClick={openCurrentGuideTarget}
              >
                Ziel-Topf öffnen
              </button>
            )}

            <button
              type="button"
              className="button"
              onClick={skipCurrentGuideTarget}
            >
              {nextGuideTargetId
                ? "Weiter zum nächsten Ziel-Topf"
                : "Führung abschließen"}
            </button>

            <button
              type="button"
              className="button"
              onClick={stopPrickingGuide}
            >
              Führung beenden
            </button>
          </div>
        </div>
      )}

      {selectedPot && (
        <>
          <div className="photo-upload">
            <p className="hint">
              Optional: Foto aufnehmen oder hochladen. Die Fotoart hilft später
              bei der Zuordnung, z. B. Aussaat, Keimkontrolle, vor dem Pikieren,
              nach dem Pikieren oder Entwicklung.
            </p>
            <div className="photo-type-select">
              <label>Fotoart</label>
              <select
                value={photoType}
                onChange={(e) => setPhotoType(e.target.value)}
              >
                {photoTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
            {photoMessage && <p className="photo-message">{photoMessage}</p>}
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

                    <p>{formatPhotoType(photo.photoType)}</p>
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

                {isPrickingHistoryReason(entry.endReason) ? (
                  <p>Ereignis am: {formatDate(entry.endedAt)}</p>
                ) : (
                  <p>
                    {formatDate(entry.startedAt)} – {formatDate(entry.endedAt)}
                  </p>
                )}

                <p>
                  {isPrickingHistoryReason(entry.endReason)
                    ? `Alter beim Pikieren: ${days ? `${days} Tage` : "-"}`
                    : `Standzeit: ${days ? `${days} Tage` : "-"}`}
                </p>

                <p>Grund: {formatHistoryReason(entry.endReason)}</p>

                {entry.endReasonNote && (
                  <p>
                    <small>Hinweis: {entry.endReasonNote}</small>
                  </p>
                )}

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
