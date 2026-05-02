// 1. externe Bibliotheken
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
// 2. interne Komponenten
import HomePage from "./pages/HomePage";
import PotPage from "./pages/PotPage";
import LabelPrintPage from "./pages/LabelPrintPage";
import SeedLibraryPage from "./pages/SeedLibraryPage";
import StatisticsPage from "./pages/StatisticsPage";
import PotFormPage from "./pages/PotFormPage";
import SeedFormPage from "./pages/SeedFormPage";
// 3. Daten / Assets
import {
  emptySeedProfile,
  buildSeedProfileData,
  validateSeedProfile,
} from "./utils/seedHelpers";

import {
  addMissingStatus,
  buildPotData,
  clearedPotData,
  emptyFormData,
  validatePotForm,
} from "./utils/potHelpers";
// 4. Styles (falls vorhanden)
import "./App.css";

function App() {
  useEffect(() => {
    fetch("http://localhost:3001/api/health")
      .then((res) => res.json())
      .then((data) => console.log("Backend:", data))
      .catch((err) => console.error("Backend Fehler:", err));
  }, []);

  const [pots, setPots] = useState([]);

  //Laden der Töpfe aus localStorage
  // Falls ältere Datensätze noch keinen Status haben, wird dieser ergänzt.

  // Merkt den aktuellen Modus: null = neuer Topf, "TOPF-002" = Bearbeiten von TOPF-002
  const [editingPotId, setEditingPotId] = useState(null);

  // Enthält die aktuellen Eingabewerte des Formulars
  const [formData, setFormData] = useState(emptyFormData);

  const [formError, setFormError] = useState("");

  // Merkt, welche Töpfe aktuell angezeigt werden sollen: alle, belegte oder leere
  const [statusFilter, setStatusFilter] = useState("all");

  // Erstellt aus allen Töpfen die Liste, die zum aktuellen Filter passt
  const filteredPots = pots.filter((pot) => {
    // Bei "all" werden alle Töpfe angezeigt
    if (statusFilter === "all") {
      return true;
    }
    // Fehlender Status wird wie "active" behandelt
    const effectiveStatus = pot.status || "active";
    // Bei "active" oder "empty" werden nur passende Töpfe angezeigt
    return effectiveStatus === statusFilter;
  });

  const [selectedLabelIds, setSelectedLabelIds] = useState([]);

  // Merkt, welches Samenprofil aktuell zum Vorausfüllen ausgewählt wurde
  const [selectedSeedProfileId, setSelectedSeedProfileId] = useState("");

  const [emptyPotCount, setEmptyPotCount] = useState(1);

  const [customSeedProfiles, setCustomSeedProfiles] = useState([]);

  const [newSeedProfile, setNewSeedProfile] = useState(emptySeedProfile);

  const [editingSeedProfileId, setEditingSeedProfileId] = useState(null);

  const [reminders, setReminders] = useState([]);

  const [hiddenReminders, setHiddenReminders] = useState(() => {
    const saved = localStorage.getItem("hiddenReminders");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }

    return {};
  });

  const [releaseReason, setReleaseReason] = useState("freigegeben");
  const [releaseReasonNote, setReleaseReasonNote] = useState("");
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [potToReleaseId, setPotToReleaseId] = useState(null);
  const [seedFilter, setSeedFilter] = useState("all");

  const filteredSeedProfiles = customSeedProfiles.filter((profile) => {
    if (seedFilter === "all") return true;

    if (seedFilter === "active") {
      return profile.profileStatus !== "nicht-brauchbar";
    }

    if (seedFilter === "inactive") {
      return profile.profileStatus === "nicht-brauchbar";
    }

    return true;
  });

  // Immer wenn sich pots ändert, werden die aktuellen Daten im localStorage gespeichert
  /*useEffect(() => {
    localStorage.setItem("pots", JSON.stringify(pots));
  }, [pots]);
  */
  /*
  useEffect(() => {
    localStorage.setItem("seedProfiles", JSON.stringify(customSeedProfiles));
  }, [customSeedProfiles]);
  */

  // Daten werden in das Formular eingegeben und in formData gespeichert
  function handleFormChange(field, value) {
    setFormData({
      ...formData,
      [field]: value,
    });
  }

  // Leert einen vorhandenen Topf, ohne seine ID zu verändern
  function handleClearPot(potId) {
    setPotToReleaseId(potId);
    setReleaseReason("freigegeben");
    setReleaseReasonNote("");
    setShowReleaseDialog(true);
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 0);
  }

  function confirmClearPot() {
    const potToClear = pots.find((pot) => pot.id === potToReleaseId);

    if (!potToClear) return;

    const finalReason = releaseReason;
    const finalReasonNote =
      releaseReason === "sonstiges" ? releaseReasonNote.trim() : "";

    fetch("http://localhost:3001/api/pot-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        potId: potToClear.id,
        plantName: potToClear.plantName,
        seedProfileId: potToClear.seedProfileId || "",
        sowingDate: potToClear.sowingDate || "",
        resowingDate: potToClear.resowingDate || "",
        potNotes: potToClear.potNotes || "",
        startedAt: potToClear.sowingDate || "",
        endedAt: new Date().toISOString().split("T")[0],
        endReason: finalReason,
        endReasonNote: finalReasonNote,
      }),
    })
      .then(() => {
        return fetch(`http://localhost:3001/api/pots/${potToReleaseId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...potToClear,
            ...clearedPotData,
          }),
        });
      })
      .then(() => {
        loadPots();
        loadReminders();

        setShowReleaseDialog(false);
        setPotToReleaseId(null);
        setReleaseReason("freigegeben");
        setReleaseReasonNote("");
        setEditingPotId(null);
        setFormError("");
      })
      .catch((err) => {
        console.error("Fehler beim Freigeben:", err);
        setFormError("Topf konnte nicht freigegeben werden.");
      });
  }

  // Fügt eine Topf-ID zur Etikettenauswahl hinzu oder entfernt sie wieder
  function handleToggleLabelSelection(potId) {
    setSelectedLabelIds((prevSelectedLabelIds) =>
      prevSelectedLabelIds.includes(potId)
        ? prevSelectedLabelIds.filter((id) => id !== potId)
        : [...prevSelectedLabelIds, potId],
    );
  }
  function getNextPotId() {
    const highestNumber = pots.reduce((highest, pot) => {
      const numberPart = Number(pot.id.replace("TOPF-", ""));

      return numberPart > highest ? numberPart : highest;
    }, 0);

    return "TOPF-" + (highestNumber + 1).toString().padStart(3, "0");
  }
  function loadPots() {
    fetch("http://localhost:3001/api/pots")
      .then((res) => res.json())
      .then((data) => {
        setPots(addMissingStatus(data));
      })
      .catch((err) => console.error("Fehler beim Laden:", err));
  }
  function loadReminders() {
    fetch("http://localhost:3001/api/reminders")
      .then((res) => res.json())
      .then((data) => setReminders(data))
      .catch((err) => console.error("Erinnerungen Fehler:", err));
  }
  function loadSeedProfiles() {
    fetch("http://localhost:3001/api/seed-profiles")
      .then((res) => res.json())
      .then((data) => setCustomSeedProfiles(data))
      .catch((err) =>
        console.error("Fehler beim Laden der Samenprofile:", err),
      );
  }
  function hideReminder(reminderKey, days = 1) {
    const hideUntil = new Date();
    hideUntil.setDate(hideUntil.getDate() + days);

    setHiddenReminders((prev) => ({
      ...prev,
      [reminderKey]: hideUntil.toISOString(),
    }));
  }
  const visibleReminders = reminders.filter((item) => {
    const key = `${item.potId}-${item.type}`;
    const hiddenUntil = hiddenReminders[key];

    if (!hiddenUntil) return true;

    return new Date() >= new Date(hiddenUntil);
  });
  function resetHiddenReminders() {
    setHiddenReminders({});
  }
  useEffect(() => {
    loadPots();
    loadReminders();
    loadSeedProfiles();
  }, []);

  useEffect(() => {
    localStorage.setItem("hiddenReminders", JSON.stringify(hiddenReminders));
  }, [hiddenReminders]);

  // Speichert Formular-Daten: entweder als neuer Topf oder als Änderung an einem bestehenden Topf
  async function handleAddPot() {
    const validationError = validatePotForm(formData);

    if (validationError) {
      setFormError(validationError);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return false;
    }

    setFormError("");

    // Gemeinsame Formulardaten für Neuanlage und Bearbeiten vorbereiten
    const potData = buildPotData(formData);
    /*
      Wenn editingPotId gesetzt ist, befindet sich die App im Bearbeiten-Modus.
      Dann wird kein neuer Topf angelegt, sondern ein vorhandener Topf aktualisiert.
    */
    try {
      if (editingPotId) {
        const response = await fetch(
          `http://localhost:3001/api/pots/${editingPotId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: editingPotId,
              ...potData,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Aktualisieren fehlgeschlagen");
        }
      } else {
        const newPot = {
          id: getNextPotId(),
          ...potData,
        };

        const response = await fetch("http://localhost:3001/api/pots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPot),
        });

        if (!response.ok) {
          throw new Error("Speichern fehlgeschlagen");
        }
      }

      loadPots();
      loadReminders();

      setFormData(emptyFormData);
      setEditingPotId(null);
      setFormError("");

      return true;
    } catch (err) {
      console.error("Fehler beim Speichern/Aktualisieren des Topfs:", err);
      setFormError("Topf konnte nicht gespeichert werden.");
      return false;
    }
  }

  // Lädt die Daten des ausgewählten Topfs in das Formular und startet den Bearbeiten-Modus
  function handleEditPot(pot) {
    setFormData({
      ...emptyFormData,
      plantName: pot.plantName,
      lifecycle: pot.lifecycle,
      sowingFromMonth: pot.sowingFromMonth,
      sowingToMonth: pot.sowingToMonth,
      germinationTempMin: pot.germinationTempMin,
      germinationTempMax: pot.germinationTempMax,
      germinationDaysMin: pot.germinationDaysMin,
      germinationDaysMax: pot.germinationDaysMax,
      sowingDepthCm: pot.sowingDepthCm,
      sowingDate: pot.sowingDate,
      resowingDate: pot.resowingDate || "",
      outdoorFromMonth: pot.outdoorFromMonth,
      outdoorToMonth: pot.outdoorToMonth,
      seedProfileId: pot.seedProfileId || "",
      potNotes: pot.potNotes || "",
    });
    /*
      Die ID des ausgewählten Topfs wird gespeichert.
      Dadurch weiß die App beim nächsten Speichern, dass kein neuer Topf angelegt,
      sondern genau dieser Topf bearbeitet werden soll.
    */
    setEditingPotId(pot.id);
    // Alte Fehlermeldung werden gelöscht
    setFormError("");
  }

  // Übernimmt die Stammdaten eines Samenprofils in das Formular
  function handleApplySeedProfile() {
    const selectedSeedProfile = customSeedProfiles.find(
      (profile) => profile.id === selectedSeedProfileId,
    );

    if (!selectedSeedProfile) {
      setFormError("Bitte zuerst ein Samenprofil auswählen.");
      return;
    }

    setFormData({
      ...formData,
      plantName: selectedSeedProfile.plantName,
      lifecycle: selectedSeedProfile.lifecycle,
      germinationTempMin: selectedSeedProfile.germinationTempMin,
      germinationTempMax: selectedSeedProfile.germinationTempMax,
      germinationDaysMin: selectedSeedProfile.germinationDaysMin,
      germinationDaysMax: selectedSeedProfile.germinationDaysMax,
      sowingDepthCm: selectedSeedProfile.sowingDepthCm,
      sowingFromMonth: selectedSeedProfile.sowingFromMonth,
      sowingToMonth: selectedSeedProfile.sowingToMonth,
      outdoorFromMonth: selectedSeedProfile.outdoorFromMonth,
      outdoorToMonth: selectedSeedProfile.outdoorToMonth,
      seedProfileId: selectedSeedProfile.id,
    });

    setFormError("");
  }
  function handleExportPots() {
    const jsonString = JSON.stringify(pots, null, 2);

    const blob = new Blob([jsonString], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const today = new Date().toISOString().split("T")[0];

    const link = document.createElement("a");
    link.href = url;
    link.download = `pots-backup-${today}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
  function handleAddEmptyPots() {
    const count = Number(emptyPotCount);

    if (!Number.isInteger(count) || count < 1) {
      setFormError("Bitte eine gültige Anzahl neuer Leertöpfe eingeben.");
      return;
    }

    const newEmptyPots = Array.from({ length: count }, (_, index) => {
      const highestNumber = pots.reduce((highest, pot) => {
        const numberPart = Number(pot.id.replace("TOPF-", ""));
        return numberPart > highest ? numberPart : highest;
      }, 0);

      const nextNumber = highestNumber + index + 1;

      return {
        id: "TOPF-" + nextNumber.toString().padStart(3, "0"),
        status: "empty",
        plantName: "",
        sowingDate: "",
        lifecycle: "annual",
        sowingFromMonth: 3,
        sowingToMonth: 5,
        germinationTempMin: 10,
        germinationTempMax: 20,
        germinationDaysMin: 7,
        germinationDaysMax: 14,
        sowingDepthCm: 1,
        outdoorFromMonth: 5,
        outdoorToMonth: 7,
        seedProfileId: "",
        resowingDate: "",
        potNotes: "",
      };
    });

    Promise.all(
      newEmptyPots.map((pot) =>
        fetch("http://localhost:3001/api/pots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pot),
        }),
      ),
    )
      .then(() => {
        loadPots();
        loadReminders();
        setEmptyPotCount(1);
        setFormError("");
      })
      .catch((err) => {
        console.error("Fehler beim Speichern der Leertöpfe:", err);
        setFormError("Leertöpfe konnten nicht gespeichert werden.");
      });
  }
  function handleSeedProfileChange(field, value) {
    setNewSeedProfile({
      ...newSeedProfile,
      [field]: value,
    });
  }
  function getNextSeedProfileId() {
    const highestNumber = customSeedProfiles.reduce((highest, profile) => {
      const numberPart = Number(profile.id.replace("SEED-", ""));
      return numberPart > highest ? numberPart : highest;
    }, 0);

    return "SEED-" + (highestNumber + 1).toString().padStart(3, "0");
  }
  function handleAddSeedProfile() {
    const validationError = validateSeedProfile(newSeedProfile);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const profileData = buildSeedProfileData(newSeedProfile);

    if (editingSeedProfileId) {
      fetch(`http://localhost:3001/api/seed-profiles/${editingSeedProfileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingSeedProfileId,
          ...profileData,
        }),
      })
        .then((res) => res.json())
        .then(() => {
          loadSeedProfiles();
        })
        .catch((err) => {
          console.error("Fehler beim Aktualisieren des Samenprofils:", err);
          setFormError("Samenprofil konnte nicht aktualisiert werden.");
        });
    } else {
      const newProfile = {
        id: getNextSeedProfileId(),
        ...profileData,
      };

      fetch("http://localhost:3001/api/seed-profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProfile),
      })
        .then((res) => res.json())
        .then(() => {
          loadSeedProfiles();
        })
        .catch((err) => {
          console.error("Fehler beim Speichern des Samenprofils:", err);
          setFormError("Samenprofil konnte nicht gespeichert werden.");
        });
    }
    setNewSeedProfile(emptySeedProfile);

    setFormError("");
    setEditingSeedProfileId(null);
  }
  function handleEditSeedProfile(profile) {
    setNewSeedProfile({
      ...emptySeedProfile,
      ...profile,
      variety: profile.variety || "",
      manufacturer: profile.manufacturer || "",
      experience: profile.experience || "",
      profileStatus: profile.profileStatus || "testen",
      profileNotes: profile.profileNotes || "",
    });

    setEditingSeedProfileId(profile.id);
  }
  function handleCreateNewSeedProfile() {
    setNewSeedProfile(emptySeedProfile);

    setEditingSeedProfileId(null);
  }
  return (
    <>
      {showReleaseDialog && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Topf freigeben</h2>
            <div className="form-field">
              <label>Beendigungsgrund</label>
              <select
                value={releaseReason}
                onChange={(e) => setReleaseReason(e.target.value)}
              >
                <option value="freigegeben">Freigegeben</option>
                <option value="geerntet">Geerntet</option>
                <option value="fehlgeschlagen">Fehlgeschlagen</option>
                <option value="umgetopft">Umgetopft</option>
                <option value="entsorgt">Entsorgt</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </div>

            {releaseReason === "sonstiges" && (
              <div className="form-field">
                <label>Grund / Sonstiges</label>
                <input
                  type="text"
                  value={releaseReasonNote}
                  onChange={(e) => setReleaseReasonNote(e.target.value)}
                />
              </div>
            )}
            <div className="filter-bar">
              <button className="button" onClick={confirmClearPot}>
                Freigabe bestätigen
              </button>

              <button
                className="button"
                onClick={() => {
                  setShowReleaseDialog(false);
                  setPotToReleaseId(null);
                  setReleaseReason("freigegeben");
                  setReleaseReasonNote("");
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              filteredPots={filteredPots}
              selectedLabelIds={selectedLabelIds}
              handleToggleLabelSelection={handleToggleLabelSelection}
              handleExportPots={handleExportPots}
              emptyPotCount={emptyPotCount}
              setEmptyPotCount={setEmptyPotCount}
              handleAddEmptyPots={handleAddEmptyPots}
              reminders={visibleReminders}
              hideReminder={hideReminder}
              resetHiddenReminders={resetHiddenReminders}
            />
          }
        />
        <Route
          path="/pot/:potId"
          element={
            <PotPage
              pots={pots}
              handleEditPot={handleEditPot}
              handleClearPot={handleClearPot}
            />
          }
        />
        <Route
          path="/labels/print"
          element={
            <LabelPrintPage pots={pots} selectedLabelIds={selectedLabelIds} />
          }
        />
        <Route
          path="/seeds"
          element={
            <SeedLibraryPage
              seedProfiles={filteredSeedProfiles}
              handleEditSeedProfile={handleEditSeedProfile}
              handleCreateNewSeedProfile={handleCreateNewSeedProfile}
              setSeedFilter={setSeedFilter}
              seedFilter={seedFilter}
            />
          }
        />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route
          path="/pots/new"
          element={
            <PotFormPage
              formData={formData}
              handleFormChange={handleFormChange}
              handleAddPot={handleAddPot}
              formError={formError}
              editingPotId={editingPotId}
              seedProfiles={customSeedProfiles}
              selectedSeedProfileId={selectedSeedProfileId}
              setSelectedSeedProfileId={setSelectedSeedProfileId}
              handleApplySeedProfile={handleApplySeedProfile}
            />
          }
        />
        <Route
          path="/seeds/new"
          element={
            <SeedFormPage
              newSeedProfile={newSeedProfile}
              handleSeedProfileChange={handleSeedProfileChange}
              handleAddSeedProfile={handleAddSeedProfile}
              editingSeedProfileId={editingSeedProfileId}
              formError={formError}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
