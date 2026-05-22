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
  if (value === "pikiert") return "Vollständig pikiert";
  if (value === "freigegeben") return "Freigegeben";
  if (value === "geerntet") return "Geerntet";
  if (value === "fehlgeschlagen") return "Fehlgeschlagen";
  if (value === "umgetopft") return "Umgetopft";
  if (value === "entsorgt") return "Entsorgt";
  if (value === "sonstiges") return "Sonstiges";

  return value || "-";
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
  const [prickingDate, setPrickingDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [seedlingsCount, setSeedlingsCount] = useState("");
  const [selectedTargetPotIds, setSelectedTargetPotIds] = useState([]);
  const [confirmReleaseSourcePot, setConfirmReleaseSourcePot] = useState(false);
  const { potId } = useParams();

  // Sucht anhand der URL den passenden Topf aus der Liste
  const selectedPot = pots.find((pot) => pot.id === potId);

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

  async function handlePreparePricking() {
    if (!selectedPot) return;

    const totalSeedlings = Number(seedlingsCount);
    const targetCount = selectedTargetPotIds.length;
    const plantsRemainingInSourcePot = totalSeedlings - targetCount;

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
      const sourcePotUpdate =
        plantsRemainingInSourcePot === 0
          ? {
              ...selectedPot,
              status: "empty",
              seedlingsCount: totalSeedlings,
              plantsInPot: 0,
              prickedDate: prickingDate,
              potNotes: selectedPot.potNotes
                ? `${selectedPot.potNotes}\nVollständig pikiert am ${prickingDate}`
                : `Vollständig pikiert am ${prickingDate}`,
            }
          : {
              ...selectedPot,
              seedlingsCount: totalSeedlings,
              plantsInPot: plantsRemainingInSourcePot,
              prickedDate: prickingDate,
            };

      const sourceResponse = await fetch(
        `${API_BASE_URL}/api/pots/${selectedPot.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sourcePotUpdate),
        },
      );

      if (!sourceResponse.ok) {
        throw new Error("Ursprungstopf konnte nicht aktualisiert werden.");
      }

      if (plantsRemainingInSourcePot === 0) {
        const historyResponse = await fetch(`${API_BASE_URL}/api/pot-history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            potId: selectedPot.id,
            plantName: selectedPot.plantName || "",
            seedProfileId: selectedPot.seedProfileId || "",
            sowingDate: selectedPot.sowingDate || "",
            resowingDate: selectedPot.resowingDate || "",
            potNotes: selectedPot.potNotes || "",
            startedAt: selectedPot.sowingDate || "",
            endedAt: prickingDate,
            endReason: "pikiert",
            endReasonNote: `Vollständig pikiert in ${targetCount} Ziel-Topf/Topf(e)`,
          }),
        });

        if (!historyResponse.ok) {
          throw new Error("Pikier-Historie konnte nicht gespeichert werden.");
        }
      }

      await Promise.all(
        selectedTargetPotIds.map((targetPotId) => {
          const targetPot = pots.find((pot) => pot.id === targetPotId);

          const targetPotUpdate = {
            ...selectedPot,
            ...targetPot,
            id: targetPotId,
            plantName: selectedPot.plantName,
            status: "active",
            sowingDate: selectedPot.sowingDate || "",
            resowingDate: selectedPot.resowingDate || "",
            lifecycle: selectedPot.lifecycle || "",
            sowingFromMonth: selectedPot.sowingFromMonth || "",
            sowingToMonth: selectedPot.sowingToMonth || "",
            germinationTempMin: selectedPot.germinationTempMin || "",
            germinationTempMax: selectedPot.germinationTempMax || "",
            germinationDaysMin: selectedPot.germinationDaysMin || "",
            germinationDaysMax: selectedPot.germinationDaysMax || "",
            sowingDepthCm: selectedPot.sowingDepthCm || "",
            outdoorFromMonth: selectedPot.outdoorFromMonth || "",
            outdoorToMonth: selectedPot.outdoorToMonth || "",
            seedProfileId: selectedPot.seedProfileId || "",
            potNotes: `Pikiert aus ${selectedPot.id}`,
            harvestFromMonth: selectedPot.harvestFromMonth || "",
            harvestToMonth: selectedPot.harvestToMonth || "",
            sowingDepthNote: selectedPot.sowingDepthNote || "",
            rowSpacingCm: selectedPot.rowSpacingCm || "",
            plantSpacingCm: selectedPot.plantSpacingCm || "",
            sowingWidthCm: selectedPot.sowingWidthCm || "",
            sowingNotes: selectedPot.sowingNotes || "",
            sowingMode: "single",
            seedCount: "",
            seedlingsCount: "",
            plantsInPot: 1,
            prickedDate: prickingDate,
            sourcePotId: selectedPot.id,
          };

          return fetch(`${API_BASE_URL}/api/pots/${targetPotId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(targetPotUpdate),
          }).then((response) => {
            if (!response.ok) {
              throw new Error(
                `Ziel-Topf ${targetPotId} konnte nicht belegt werden.`,
              );
            }

            return response;
          });
        }),
      );

      loadPots();
      loadReminders();

      setShowPrickingDialog(false);
      setSelectedTargetPotIds([]);
      setConfirmReleaseSourcePot(false);
      setPrickingMessage("");
      setPhotoType("pricking");
      setPhotoMessage(
        plantsRemainingInSourcePot === 0
          ? `Pikieren abgeschlossen: ${targetCount} Ziel-Topf/Topf(e) belegt, Ursprungstopf wurde freigegeben.`
          : `Pikieren vorbereitet: ${targetCount} Ziel-Topf/Topf(e) belegt, ${plantsRemainingInSourcePot} Pflanze(n) bleiben im Ursprungstopf.`,
      );
    } catch (error) {
      console.error("Fehler beim Pikieren:", error);
      setPrickingMessage("Pikieren konnte nicht gespeichert werden.");
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
          {selectedPot.status !== "empty" && (
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
        </>
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

                <p>
                  {formatDate(entry.startedAt)} – {formatDate(entry.endedAt)}
                </p>

                <p>Standzeit: {days ? `${days} Tage` : "-"}</p>

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
