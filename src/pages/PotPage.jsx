// src/pages/PotPage.jsx

import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PotDetails from "../components/PotDetails";
import { API_BASE_URL } from "../utils/appConfig";

const PRICKING_GUIDE_STORAGE_KEY = "activePrickingGuide";

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

function formatPotStatus(value) {
  if (value === "active") return "belegt";
  if (value === "empty") return "frei";

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
  const [prickingEvents, setPrickingEvents] = useState([]);
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

  const [prickingGuideSourcePotId, setPrickingGuideSourcePotId] = useState(
    () => {
      const saved = localStorage.getItem(PRICKING_GUIDE_STORAGE_KEY);

      if (!saved) return "";

      try {
        const parsed = JSON.parse(saved);

        return parsed.sourcePotId || "";
      } catch {
        return "";
      }
    },
  );

  const [prickingGuideTargetIds, setPrickingGuideTargetIds] = useState(() => {
    const saved = localStorage.getItem(PRICKING_GUIDE_STORAGE_KEY);

    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);

      return Array.isArray(parsed.targetPotIds) ? parsed.targetPotIds : [];
    } catch {
      return [];
    }
  });

  const [prickingGuideIndex, setPrickingGuideIndex] = useState(() => {
    const saved = localStorage.getItem(PRICKING_GUIDE_STORAGE_KEY);

    if (!saved) return 0;

    try {
      const parsed = JSON.parse(saved);
      const parsedIndex = Number(parsed.currentIndex);

      return Number.isInteger(parsedIndex) && parsedIndex >= 0
        ? parsedIndex
        : 0;
    } catch {
      return 0;
    }
  });

  const { potId } = useParams();

  // Sucht anhand der URL den passenden Topf aus der Liste
  const selectedPot = pots.find((pot) => pot.id === potId);

  const canPrickPot =
    selectedPot && selectedPot.status !== "empty" && !selectedPot.sourcePotId;

  const isPrickedTargetPot =
    selectedPot &&
    selectedPot.status !== "empty" &&
    Boolean(selectedPot.sourcePotId);

  const hasStoredSourceDetails =
    selectedPot &&
    (selectedPot.sourcePlantName ||
      selectedPot.sourceSeedProfileId ||
      selectedPot.sourcePrickingDate);

  const isLegacyPrickedTargetPot =
    isPrickedTargetPot && !hasStoredSourceDetails;

  const sourceDisplayPlantName =
    selectedPot?.sourcePlantName || selectedPot?.plantName || "-";

  const sourceDisplayPrickingDate =
    selectedPot?.sourcePrickingDate || selectedPot?.prickedDate || "";

  const prickedTargetPots = selectedPot
    ? pots.filter(
        (pot) =>
          pot.sourcePotId === selectedPot.id &&
          (pot.status || "active") !== "empty",
      )
    : [];

  const hasPrickedTargetPots = prickedTargetPots.length > 0;

  const photoHintText = isPrickedTargetPot
    ? "Optional: Foto des Ziel-Topfs aufnehmen oder hochladen. Nach dem Pikieren sind Fotos zur Anwachsphase und weiteren Entwicklung besonders sinnvoll."
    : hasPrickedTargetPots
      ? "Optional: Foto des Ursprungstopfs aufnehmen oder hochladen. Nach dem Pikieren kann dokumentiert werden, wie viele Pflanzen im Ursprungstopf verbleiben und wie sich diese weiterentwickeln."
      : "Optional: Foto aufnehmen oder hochladen. Die Fotoart hilft später bei der Zuordnung, z. B. Aussaat, Keimkontrolle, vor dem Pikieren, nach dem Pikieren oder Entwicklung.";

  const recommendedPhotoText = isPrickedTargetPot
    ? "Empfehlung: Bei pikierten Ziel-Töpfen zuerst „Pikiert / nach dem Pikieren“ verwenden. Für spätere Kontrollen dann „Entwicklung“."
    : hasPrickedTargetPots
      ? "Empfehlung: Beim Ursprungstopf nach dem Pikieren „Entwicklung“ verwenden, wenn der weitere Wuchs dokumentiert werden soll."
      : "Empfehlung: Wähle die Fotoart passend zum aktuellen Arbeitsschritt.";

  const siblingPrickedTargetPots = isPrickedTargetPot
    ? pots
        .filter(
          (pot) =>
            pot.sourcePotId === selectedPot.sourcePotId &&
            (pot.status || "active") !== "empty",
        )
        .sort((a, b) => a.id.localeCompare(b.id, "de"))
    : [];

  const currentSiblingTargetIndex = siblingPrickedTargetPots.findIndex(
    (pot) => pot.id === selectedPot?.id,
  );

  const previousSiblingTargetPot =
    currentSiblingTargetIndex > 0
      ? siblingPrickedTargetPots[currentSiblingTargetIndex - 1]
      : null;

  const nextSiblingTargetPot =
    currentSiblingTargetIndex >= 0 &&
    currentSiblingTargetIndex + 1 < siblingPrickedTargetPots.length
      ? siblingPrickedTargetPots[currentSiblingTargetIndex + 1]
      : null;

  const currentGuideTargetId = prickingGuideTargetIds[prickingGuideIndex] || "";

  const currentGuideTargetPot = currentGuideTargetId
    ? pots.find((pot) => pot.id === currentGuideTargetId)
    : null;

  const hasActivePrickingGuide =
    prickingGuideTargetIds.length > 0 && Boolean(currentGuideTargetId);

  const isCurrentGuideTargetPage =
    hasActivePrickingGuide && selectedPot?.id === currentGuideTargetId;

  const shouldAdvancePrickingGuideAfterPhoto =
    hasActivePrickingGuide &&
    isCurrentGuideTargetPage &&
    photoType === "pricking";

  function clearStoredPrickingGuide() {
    localStorage.removeItem(PRICKING_GUIDE_STORAGE_KEY);
  }

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
    fetch(`${API_BASE_URL}/api/pricking/events/${potId}`)
      .then((res) => res.json())
      .then((data) => setPrickingEvents(data))
      .catch((err) => console.error("Pikierereignisse Fehler:", err));
  }, [potId, pots]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/photos/${potId}`)
      .then((res) => res.json())
      .then((data) => setPhotos(data))
      .catch((err) => console.error("Fotos Fehler:", err));
  }, [potId]);

  useEffect(() => {
    if (isPrickedTargetPot) {
      setPhotoType("pricking");
      return;
    }

    if (hasPrickedTargetPots) {
      setPhotoType("progress");
    }
  }, [isPrickedTargetPot, hasPrickedTargetPots, potId]);

  useEffect(() => {
    if (prickingGuideTargetIds.length === 0) {
      clearStoredPrickingGuide();
      return;
    }

    localStorage.setItem(
      PRICKING_GUIDE_STORAGE_KEY,
      JSON.stringify({
        sourcePotId: prickingGuideSourcePotId,
        targetPotIds: prickingGuideTargetIds,
        currentIndex: prickingGuideIndex,
        updatedAt: new Date().toISOString(),
      }),
    );
  }, [prickingGuideSourcePotId, prickingGuideTargetIds, prickingGuideIndex]);

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
      clearStoredPrickingGuide();

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
    clearStoredPrickingGuide();
  }

  function openNextPrickedTargetAfterPhoto() {
    if (!nextSiblingTargetPot) return;

    setPhotoMessage("");
    setPhotoType("pricking");
    navigate(`/pot/${nextSiblingTargetPot.id}`);
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

      fetch(`${API_BASE_URL}/api/pricking/events/${selectedPot.id}`)
        .then((res) => res.json())
        .then((data) => setPrickingEvents(data))
        .catch((err) => console.error("Pikierereignisse Fehler:", err));

      setShowPrickingDialog(false);
      setSelectedTargetPotIds([]);
      setConfirmReleaseSourcePot(false);
      setPrickingMessage("");
      const nextGuideTargetIds = data.targetPotIds || selectedTargetPotIds;

      setPhotoType("pricking");
      setPrickingGuideTargetIds(nextGuideTargetIds);
      setPrickingGuideIndex(0);
      setPrickingGuideSourcePotId(selectedPot.id);

      localStorage.setItem(
        PRICKING_GUIDE_STORAGE_KEY,
        JSON.stringify({
          sourcePotId: selectedPot.id,
          targetPotIds: nextGuideTargetIds,
          currentIndex: 0,
          updatedAt: new Date().toISOString(),
        }),
      );

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

      if (shouldAdvancePrickingGuideAfterPhoto) {
        setPhotoMessage(
          nextGuideTargetId
            ? `Foto wurde gespeichert. Weiter zum nächsten Ziel-Topf: ${nextGuideTargetId}`
            : "Foto wurde gespeichert. Pikierführung kann abgeschlossen werden.",
        );
        loadReminders();
        skipCurrentGuideTarget();
        return;
      }

      if (nextSiblingTargetPot && photoType === "pricking") {
        setPhotoMessage(
          `Foto wurde gespeichert. Nächster Ziel-Topf: ${nextSiblingTargetPot.id}`,
        );
      } else {
        setPhotoMessage("Foto wurde gespeichert.");
      }

      loadReminders();

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
                Ziel-Töpfe verteilt werden.
                {prickedTargetPots.length > 0
                  ? ` Aus diesem Ursprungstopf wurden bereits ${prickedTargetPots.length} Ziel-Topf/Topf(e) belegt.`
                  : ""}
              </p>

              {prickedTargetPots.length > 0 && (
                <p className="form-muted-text">
                  Verbleibend im Ursprungstopf:{" "}
                  <strong>{selectedPot.plantsInPot || "-"} Pflanze(n)</strong>
                </p>
              )}

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
                Dieser Topf wurde aus <strong>{selectedPot.sourcePotId}</strong>{" "}
                pikiert und wird ab hier als eigenständiger Ziel-Topf
                weitergeführt. Eine erneute Verteilung über den normalen
                Pikierdialog ist für diesen Topf nicht vorgesehen.
              </p>

              <div className="detail-fact-grid">
                <p>
                  <span className="detail-label">Ursprungstopf</span>
                  <strong>{selectedPot.sourcePotId || "-"}</strong>
                </p>

                <p>
                  <span className="detail-label">Pflanze</span>
                  <strong>{sourceDisplayPlantName}</strong>
                </p>

                <p>
                  <span className="detail-label">Samenprofil Ursprung</span>
                  <strong>{selectedPot.sourceSeedProfileId || "-"}</strong>
                </p>

                <p>
                  <span className="detail-label">Pikiert am</span>
                  <strong>
                    {sourceDisplayPrickingDate
                      ? new Date(sourceDisplayPrickingDate).toLocaleDateString(
                          "de-DE",
                        )
                      : "-"}
                  </strong>
                </p>
              </div>

              {isLegacyPrickedTargetPot ? (
                <p className="form-muted-text">
                  Hinweis: Dieser Ziel-Topf stammt aus älteren Pikierdaten. Die
                  Verbindung zum Ursprungstopf ist vorhanden, aber zusätzliche
                  Herkunftsdaten wie Ursprungspflanze, Samenprofil und
                  Herkunfts-Pikierdatum wurden damals noch nicht separat am
                  Ziel-Topf gespeichert.
                </p>
              ) : (
                <p className="form-muted-text">
                  Die Herkunftsdaten sind am Ziel-Topf gespeichert. Sie bleiben
                  lesbar, auch wenn der Ursprungstopf später freigegeben oder
                  neu belegt wird.
                </p>
              )}

              {siblingPrickedTargetPots.length > 1 && (
                <p className="form-muted-text">
                  Ziel-Topf{" "}
                  <strong>
                    {currentSiblingTargetIndex + 1} von{" "}
                    {siblingPrickedTargetPots.length}
                  </strong>{" "}
                  aus Ursprungstopf <strong>{selectedPot.sourcePotId}</strong>
                </p>
              )}

              <div className="filter-bar">
                {previousSiblingTargetPot && (
                  <Link
                    to={`/pot/${previousSiblingTargetPot.id}`}
                    className="button-link"
                  >
                    Vorheriger Ziel-Topf {previousSiblingTargetPot.id}
                  </Link>
                )}

                {nextSiblingTargetPot && (
                  <Link
                    to={`/pot/${nextSiblingTargetPot.id}`}
                    className="button-link"
                  >
                    Nächster Ziel-Topf {nextSiblingTargetPot.id}
                  </Link>
                )}

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
            <strong>Pikiert / nach dem Pikieren</strong>. Wenn das Foto auf dem
            aktuell geführten Ziel-Topf gespeichert wird, springt die Führung
            automatisch zum nächsten Ziel-Topf. Du kannst den Schritt auch
            überspringen.
          </p>

          <p className="form-muted-text">
            Diese Pikierführung bleibt gespeichert, bis sie abgeschlossen oder
            bewusst beendet wird.
          </p>

          {currentGuideTargetPot && (
            <p className="form-muted-text">
              Pflanze: <strong>{currentGuideTargetPot.plantName || "-"}</strong>
            </p>
          )}

          {isCurrentGuideTargetPage ? (
            <p className="form-muted-text">
              Du befindest dich auf dem aktuell geführten Ziel-Topf. Ein Foto
              mit der Fotoart <strong>Pikiert / nach dem Pikieren</strong>{" "}
              schaltet die Führung automatisch weiter.
            </p>
          ) : (
            <p className="form-muted-text">
              Du befindest dich aktuell nicht auf dem geführten Ziel-Topf. Fotos
              an diesem Topf werden gespeichert, schalten die Pikierführung aber
              nicht weiter.
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
            <p className="hint">{photoHintText}</p>

            <p className="form-muted-text">{recommendedPhotoText}</p>
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
              {isPrickedTargetPot
                ? "Foto Ziel-Topf aufnehmen / hochladen"
                : hasPrickedTargetPots
                  ? "Foto Ursprungstopf aufnehmen / hochladen"
                  : "Foto aufnehmen / hochladen"}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                hidden
              />
            </label>
            {photoMessage && <p className="photo-message">{photoMessage}</p>}

            {photoMessage &&
              photoMessage.startsWith("Foto wurde gespeichert") &&
              nextSiblingTargetPot &&
              photoType === "pricking" && (
                <div className="filter-bar">
                  <button
                    type="button"
                    className="button"
                    onClick={openNextPrickedTargetAfterPhoto}
                  >
                    Nächsten Ziel-Topf {nextSiblingTargetPot.id} öffnen
                  </button>
                </div>
              )}
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

      {selectedPot && prickingEvents.length > 0 && (
        <section className="card-light page-actions-large">
          <h2>Pikierhistorie</h2>

          <div className="history-wrapper">
            {prickingEvents.map((event) => {
              const targetIds = Array.isArray(event.targetPotIds)
                ? event.targetPotIds
                : [];

              const isSourceEvent = event.sourcePotId === selectedPot.id;
              const isTargetEvent = targetIds.includes(selectedPot.id);

              return (
                <div key={event.id} className="history-entry">
                  <p>
                    <strong>
                      {isSourceEvent
                        ? "Pikierung aus diesem Ursprungstopf"
                        : isTargetEvent
                          ? "Entstanden durch Pikierung"
                          : "Pikierereignis"}
                    </strong>
                  </p>

                  <p>
                    Pikierdatum:{" "}
                    {event.prickingDate
                      ? new Date(event.prickingDate).toLocaleDateString("de-DE")
                      : "-"}
                  </p>
                  {event.createdAt && (
                    <p>
                      Gespeichert am:{" "}
                      {new Date(event.createdAt).toLocaleString("de-DE")}
                    </p>
                  )}

                  <p>
                    Ursprungstopf: <strong>{event.sourcePotId || "-"}</strong>
                    {event.sourcePotStatus
                      ? ` · aktuell ${formatPotStatus(event.sourcePotStatus)}`
                      : ""}
                  </p>

                  <p>
                    Pflanze: <strong>{event.sourcePlantName || "-"}</strong>
                  </p>

                  {event.sourceSeedProfileId && (
                    <p>
                      Samenprofil: <strong>{event.sourceSeedProfileId}</strong>
                    </p>
                  )}

                  <p>
                    Entstandene Pflanzen:{" "}
                    <strong>{event.totalSeedlings ?? "-"}</strong>
                  </p>

                  <p>
                    Ziel-Töpfe:{" "}
                    <strong>
                      {targetIds.length > 0 ? targetIds.join(", ") : "-"}
                    </strong>
                  </p>

                  {event.targetPotDetails?.length > 0 && (
                    <div className="detail-fact-grid">
                      {event.targetPotDetails.map((targetPot) => (
                        <p key={targetPot.id}>
                          <span className="detail-label">
                            Ziel-Topf {targetPot.id}
                          </span>
                          <strong>
                            {targetPot.exists
                              ? `${formatPotStatus(targetPot.status)} · ${
                                  targetPot.plantName || "-"
                                }`
                              : "nicht gefunden"}
                          </strong>
                        </p>
                      ))}
                    </div>
                  )}

                  <p>
                    Verbleibend im Ursprungstopf:{" "}
                    <strong>{event.plantsRemainingInSourcePot ?? "-"}</strong>
                  </p>

                  <div className="filter-bar reminder-actions">
                    {event.sourcePotId &&
                      event.sourcePotId !== selectedPot.id && (
                        <Link
                          to={`/pot/${event.sourcePotId}`}
                          className="button-link"
                        >
                          Ursprungstopf öffnen
                        </Link>
                      )}

                    {event.targetPotDetails
                      ?.filter((targetPot) => targetPot.id !== selectedPot.id)
                      .map((targetPot) =>
                        targetPot.exists ? (
                          <Link
                            key={targetPot.id}
                            to={`/pot/${targetPot.id}`}
                            className="button-link"
                          >
                            Ziel-Topf {targetPot.id} öffnen
                          </Link>
                        ) : (
                          <span
                            key={targetPot.id}
                            className="button-link button-link-disabled"
                          >
                            Ziel-Topf {targetPot.id} nicht gefunden
                          </span>
                        ),
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
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

                {entry.sourcePotId && (
                  <p>
                    <small>
                      Pikiertes Ziel aus Ursprungstopf:{" "}
                      <strong>{entry.sourcePotId}</strong>
                      {entry.sourcePlantName
                        ? ` · Pflanze: ${entry.sourcePlantName}`
                        : ""}
                      {entry.sourceSeedProfileId
                        ? ` · Samenprofil: ${entry.sourceSeedProfileId}`
                        : ""}
                      {entry.sourcePrickingDate
                        ? ` · Pikiert am ${new Date(
                            entry.sourcePrickingDate,
                          ).toLocaleDateString("de-DE")}`
                        : ""}
                    </small>
                  </p>
                )}

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
