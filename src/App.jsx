// src/App.jsx

// 1. externe Bibliotheken
import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
// 2. interne Komponenten
import HomePage from "./pages/HomePage";
import PotPage from "./pages/PotPage";
import LabelPrintPage from "./pages/LabelPrintPage";
import SeedLibraryPage from "./pages/SeedLibraryPage";
import StatisticsPage from "./pages/StatisticsPage";
import PotFormPage from "./pages/PotFormPage";
import SeedFormPage from "./pages/SeedFormPage";
import PlanningPage from "./pages/PlanningPage";
// 3. Daten / Assets
import {
  emptySeedProfile,
  buildSeedProfileData,
  validateSeedProfile,
  getNextSeedProfileId,
} from "./utils/seedHelpers";

import {
  addMissingStatus,
  buildPotData,
  buildEmptyPot,
  clearedPotData,
  emptyFormData,
  validatePotForm,
  getNextPotId,
} from "./utils/potHelpers";

import { API_BASE_URL } from "./utils/appConfig";
// 4. Styles (falls vorhanden)
import "./App.css";

function App() {
  const location = useLocation();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
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

  const [seedProfilePhotos, setSeedProfilePhotos] = useState([]);

  const [newSeedProfile, setNewSeedProfile] = useState(emptySeedProfile);

  const [editingSeedProfileId, setEditingSeedProfileId] = useState(null);

  const [reminders, setReminders] = useState([]);

  const [prickingConsistency, setPrickingConsistency] = useState(null);

  const [seedSearch, setSeedSearch] = useState("");

  const [seedSort, setSeedSort] = useState("name-asc");

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

  const [doneReminders, setDoneReminders] = useState(() => {
    const saved = localStorage.getItem("doneReminders");

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
  const [confirmReleaseAwareness, setConfirmReleaseAwareness] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [potToReleaseId, setPotToReleaseId] = useState(null);
  const [seedFilter, setSeedFilter] = useState("all");

  const filteredSeedProfiles = customSeedProfiles
    .filter((profile) => {
      const matchesFilter =
        seedFilter === "all" ||
        (seedFilter === "active" &&
          profile.profileStatus !== "nicht-brauchbar") ||
        (seedFilter === "inactive" &&
          profile.profileStatus === "nicht-brauchbar");

      const searchText = [
        profile.plantName,
        profile.variety,
        profile.manufacturer,
        profile.experience,
        profile.profileNotes,
        profile.id,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(seedSearch.toLowerCase());

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (seedSort === "name-asc") {
        return (a.plantName || "").localeCompare(b.plantName || "", "de");
      }

      if (seedSort === "name-desc") {
        return (b.plantName || "").localeCompare(a.plantName || "", "de");
      }

      if (seedSort === "status") {
        return (a.profileStatus || "").localeCompare(
          b.profileStatus || "",
          "de",
        );
      }

      return 0;
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
    setConfirmReleaseAwareness(false);
    setFormError("");
    setShowReleaseDialog(true);
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 0);
  }

  function confirmClearPot() {
    const potToClear = potToRelease;

    if (!potToClear) return;

    if (!confirmReleaseAwareness) {
      setFormError(
        "Bitte bestätige, dass die Auswirkungen der Topf-Freigabe verstanden wurden.",
      );
      return;
    }

    const finalReason = releaseReason;
    const finalReasonNote =
      releaseReason === "sonstiges" ? releaseReasonNote.trim() : "";

    fetch(`${API_BASE_URL}/api/pot-history`, {
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
        return fetch(`${API_BASE_URL}/api/pots/${potToReleaseId}`, {
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
        loadPrickingConsistency();

        setShowReleaseDialog(false);
        setPotToReleaseId(null);
        setReleaseReason("freigegeben");
        setReleaseReasonNote("");
        setConfirmReleaseAwareness(false);
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

  function loadPots() {
    fetch(`${API_BASE_URL}/api/pots`)
      .then((res) => res.json())
      .then((data) => {
        setPots(addMissingStatus(data));
      })
      .catch((err) => console.error("Fehler beim Laden:", err));
  }
  function loadReminders() {
    fetch(`${API_BASE_URL}/api/reminders`)
      .then((res) => res.json())
      .then((data) => setReminders(data))
      .catch((err) => console.error("Erinnerungen Fehler:", err));
  }

  function loadPrickingConsistency() {
    fetch(`${API_BASE_URL}/api/pricking/consistency`)
      .then((res) => res.json())
      .then((data) => setPrickingConsistency(data))
      .catch((err) => console.error("Pikier-Konsistenzprüfung Fehler:", err));
  }

  function loadSeedProfiles() {
    fetch(`${API_BASE_URL}/api/seed-profiles`)
      .then((res) => res.json())
      .then((data) => setCustomSeedProfiles(data))
      .catch((err) =>
        console.error("Fehler beim Laden der Samenprofile:", err),
      );
  }

  function loadSeedProfilePhotos() {
    fetch(`${API_BASE_URL}/api/seed-profile-photos`)
      .then((res) => res.json())
      .then((data) => setSeedProfilePhotos(data))
      .catch((err) =>
        console.error("Fehler beim Laden der Samenprofil-Fotos:", err),
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

    if (doneReminders[key]) {
      return false;
    }

    const hiddenUntil = hiddenReminders[key];

    if (!hiddenUntil) return true;

    return new Date() >= new Date(hiddenUntil);
  });

  const potToRelease = pots.find((pot) => pot.id === potToReleaseId);

  const activeTargetPotsForRelease = potToRelease
    ? pots
        .filter(
          (pot) =>
            pot.sourcePotId === potToRelease.id &&
            (pot.status || "active") !== "empty",
        )
        .sort((a, b) => a.id.localeCompare(b.id, "de"))
    : [];

  const hasActiveTargetPotsForRelease = activeTargetPotsForRelease.length > 0;

  function resetHiddenReminders() {
    setHiddenReminders({});
    setDoneReminders({});
  }

  function markReminderDone(reminderKey) {
    setDoneReminders((prev) => ({
      ...prev,
      [reminderKey]: new Date().toISOString(),
    }));
  }

  useEffect(() => {
    loadPots();
    loadReminders();
    loadPrickingConsistency();
    loadSeedProfiles();
    loadSeedProfilePhotos();
  }, []);

  useEffect(() => {
    if (!location.pathname.startsWith("/seeds/edit/")) {
      return;
    }

    const seedProfileIdFromPath = decodeURIComponent(
      location.pathname.replace("/seeds/edit/", ""),
    );

    if (!seedProfileIdFromPath || customSeedProfiles.length === 0) {
      return;
    }

    const profileFromRoute = customSeedProfiles.find(
      (profile) => profile.id === seedProfileIdFromPath,
    );

    if (!profileFromRoute) {
      return;
    }

    setNewSeedProfile({
      ...emptySeedProfile,
      ...profileFromRoute,
      variety: profileFromRoute.variety || "",
      manufacturer: profileFromRoute.manufacturer || "",
      retailer: profileFromRoute.retailer || "",
      experience: profileFromRoute.experience || "",
      profileStatus: profileFromRoute.profileStatus || "testen",
      profileNotes: profileFromRoute.profileNotes || "",
      sowingDepthNote: profileFromRoute.sowingDepthNote || "",
      rowSpacingCm: profileFromRoute.rowSpacingCm || "",
      plantSpacingCm: profileFromRoute.plantSpacingCm || "",
      sowingWidthCm: profileFromRoute.sowingWidthCm || "",
      sowingNotes: profileFromRoute.sowingNotes || "",
    });

    setEditingSeedProfileId(profileFromRoute.id);
  }, [location.pathname, customSeedProfiles]);

  useEffect(() => {
    localStorage.setItem("hiddenReminders", JSON.stringify(hiddenReminders));
  }, [hiddenReminders]);

  useEffect(() => {
    localStorage.setItem("doneReminders", JSON.stringify(doneReminders));
  }, [doneReminders]);

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
        const existingPot = pots.find((pot) => pot.id === editingPotId);
        const protectedPotData = preserveProtectedPrickingFields(
          existingPot,
          potData,
        );

        const response = await fetch(
          `${API_BASE_URL}/api/pots/${editingPotId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: editingPotId,
              ...protectedPotData,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Aktualisieren fehlgeschlagen");
        }
      } else {
        const newPot = {
          id: getNextPotId(pots),
          ...potData,
        };

        const response = await fetch(`${API_BASE_URL}/api/pots`, {
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
      loadPrickingConsistency();

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
  function loadPotIntoForm(pot) {
    setFormData({
      ...emptyFormData,
      ...pot,
      seedProfileId: pot.seedProfileId || "",
      resowingDate: pot.resowingDate || "",
      potNotes: pot.potNotes || "",
      sowingDepthNote: pot.sowingDepthNote || "",
      rowSpacingCm: pot.rowSpacingCm || "",
      plantSpacingCm: pot.plantSpacingCm || "",
      sowingWidthCm: pot.sowingWidthCm || "",
      sowingNotes: pot.sowingNotes || "",
      sowingMode: pot.sowingMode || "single",
      seedCount: pot.seedCount ?? "",
      seedlingsCount: pot.seedlingsCount ?? "",
      plantsInPot: pot.plantsInPot ?? "",
      prickedDate: pot.prickedDate || "",
      sourcePotId: pot.sourcePotId || "",
      sourcePlantName: pot.sourcePlantName || "",
      sourceSeedProfileId: pot.sourceSeedProfileId || "",
      sourcePrickingDate: pot.sourcePrickingDate || "",
    });

    setEditingPotId(pot.id);
    setSelectedSeedProfileId(pot.seedProfileId || "");
    setFormError("");
  }

  function handleEditPot(pot) {
    loadPotIntoForm(pot);
  }

  function preserveProtectedPrickingFields(existingPot, potData) {
    if (!existingPot?.sourcePotId) {
      return potData;
    }

    return {
      ...potData,
      sourcePotId: existingPot.sourcePotId || "",
      sourcePlantName: existingPot.sourcePlantName || "",
      sourceSeedProfileId: existingPot.sourceSeedProfileId || "",
      sourcePrickingDate: existingPot.sourcePrickingDate || "",
    };
  }

  function handleEditPotById(potId) {
    const potToEdit = pots.find((pot) => pot.id === potId);

    if (!potToEdit) {
      setFormError("Der ausgewählte Topf wurde nicht gefunden.");
      return false;
    }

    loadPotIntoForm(potToEdit);
    return true;
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
      sowingDepthNote: selectedSeedProfile.sowingDepthNote || "",
      sowingWidthCm: selectedSeedProfile.sowingWidthCm || "",
      sowingNotes: selectedSeedProfile.sowingNotes || "",
      rowSpacingCm: selectedSeedProfile.rowSpacingCm || "",
      plantSpacingCm: selectedSeedProfile.plantSpacingCm || "",
      sowingFromMonth: selectedSeedProfile.sowingFromMonth,
      sowingToMonth: selectedSeedProfile.sowingToMonth,
      outdoorFromMonth: selectedSeedProfile.outdoorFromMonth,
      outdoorToMonth: selectedSeedProfile.outdoorToMonth,
      harvestFromMonth: selectedSeedProfile.harvestFromMonth || "",
      harvestToMonth: selectedSeedProfile.harvestToMonth || "",
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

    const startNumber = Number(getNextPotId(pots).replace("TOPF-", ""));

    const newEmptyPots = Array.from({ length: count }, (_, index) => {
      const nextNumber = startNumber + index;

      return buildEmptyPot("TOPF-" + nextNumber.toString().padStart(3, "0"));
    });

    Promise.all(
      newEmptyPots.map((pot) =>
        fetch(`${API_BASE_URL}/api/pots`, {
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
        loadPrickingConsistency();

        setEmptyPotCount(1);
        setFormError("");
      })
      .catch((err) => {
        console.error("Fehler beim Speichern der Leertöpfe:", err);
        setFormError("Leertöpfe konnten nicht gespeichert werden.");
      });
  }
  function handleSeedProfileChange(field, value) {
    setNewSeedProfile((prevSeedProfile) => ({
      ...prevSeedProfile,
      [field]: value,
    }));
  }

  async function handleAddSeedProfile(seedProfileIdFromRoute, options = {}) {
    const { stayOnPage = false } = options;

    const validationError = validateSeedProfile(newSeedProfile);

    if (validationError) {
      setFormError(validationError);
      return false;
    }

    const profileData = buildSeedProfileData(newSeedProfile);
    const effectiveEditingSeedProfileId =
      editingSeedProfileId || seedProfileIdFromRoute;

    try {
      if (effectiveEditingSeedProfileId) {
        const response = await fetch(
          `${API_BASE_URL}/api/seed-profiles/${effectiveEditingSeedProfileId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: effectiveEditingSeedProfileId,
              ...profileData,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Aktualisieren fehlgeschlagen");
        }
      } else {
        const newProfile = {
          id: getNextSeedProfileId(customSeedProfiles),
          ...profileData,
        };

        const response = await fetch(`${API_BASE_URL}/api/seed-profiles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newProfile),
        });

        if (!response.ok) {
          throw new Error("Speichern fehlgeschlagen");
        }
      }

      loadSeedProfiles();
      setFormError("");

      if (!stayOnPage) {
        setNewSeedProfile(emptySeedProfile);
        setEditingSeedProfileId(null);
      }

      return true;
    } catch (err) {
      console.error(
        "Fehler beim Speichern/Aktualisieren des Samenprofils:",
        err,
      );
      setFormError("Samenprofil konnte nicht gespeichert werden.");
      return false;
    }
  }

  function handleEditSeedProfile(profile) {
    setNewSeedProfile({
      ...emptySeedProfile,
      ...profile,
      variety: profile.variety || "",
      manufacturer: profile.manufacturer || "",
      retailer: profile.retailer || "",
      experience: profile.experience || "",
      profileStatus: profile.profileStatus || "testen",
      profileNotes: profile.profileNotes || "",
      sowingDepthNote: profile.sowingDepthNote || "",
      rowSpacingCm: profile.rowSpacingCm || "",
      plantSpacingCm: profile.plantSpacingCm || "",
      sowingWidthCm: profile.sowingWidthCm || "",
      sowingNotes: profile.sowingNotes || "",
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

            {potToRelease && (
              <p className="form-muted-text">
                Topf: <strong>{potToRelease.id}</strong>
                {potToRelease.plantName ? ` – ${potToRelease.plantName}` : ""}
              </p>
            )}

            <div className="error-box">
              <strong>Wichtiger Hinweis:</strong> Die Freigabe leert nur diesen
              Topf und schreibt den aktuellen Zustand in den Verlauf. Die
              Topf-ID bleibt erhalten und kann später neu belegt werden.
              {hasActiveTargetPotsForRelease && (
                <>
                  <br />
                  <br />
                  Zu diesem Topf bestehen noch pikiert erzeugte aktive
                  Ziel-Töpfe. Diese Ziel-Töpfe bleiben erhalten und werden durch
                  die Freigabe nicht verändert.
                  <br />
                  <br />
                  Aktive Ziel-Töpfe:{" "}
                  <strong>
                    {activeTargetPotsForRelease.map((pot) => pot.id).join(", ")}
                  </strong>
                  <br />
                  <br />
                  Bereits gespeicherte Herkunftsdaten an Ziel-Töpfen bleiben
                  dort erhalten. Bei älteren Ziel-Töpfen kann die Herkunft nur
                  eingeschränkt dokumentiert sein.
                </>
              )}
            </div>

            {formError && <p className="error-box">{formError}</p>}

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

            <label className="label-select-checkbox">
              <input
                type="checkbox"
                checked={confirmReleaseAwareness}
                onChange={(event) =>
                  setConfirmReleaseAwareness(event.target.checked)
                }
              />
              Ich habe verstanden, dass dieser Topf geleert und der aktuelle
              Zustand in den Verlauf übernommen wird.
            </label>

            <div className="filter-bar">
              <button
                className="button"
                onClick={confirmClearPot}
                disabled={!confirmReleaseAwareness}
              >
                {hasActiveTargetPotsForRelease
                  ? "Freigabe trotz Ziel-Töpfen bestätigen"
                  : "Freigabe bestätigen"}
              </button>

              <button
                className="button"
                onClick={() => {
                  setShowReleaseDialog(false);
                  setPotToReleaseId(null);
                  setReleaseReason("freigegeben");
                  setReleaseReasonNote("");
                  setConfirmReleaseAwareness(false);
                  setFormError("");
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
              markReminderDone={markReminderDone}
              prickingConsistency={prickingConsistency}
              loadPrickingConsistency={loadPrickingConsistency}
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
              loadPots={loadPots}
              loadReminders={loadReminders}
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
              seedProfilePhotos={seedProfilePhotos}
              handleEditSeedProfile={handleEditSeedProfile}
              handleCreateNewSeedProfile={handleCreateNewSeedProfile}
              setSeedFilter={setSeedFilter}
              seedFilter={seedFilter}
              seedSearch={seedSearch}
              setSeedSearch={setSeedSearch}
              seedSort={seedSort}
              setSeedSort={setSeedSort}
            />
          }
        />

        <Route path="/statistics" element={<StatisticsPage />} />
        <Route
          path="/planning"
          element={<PlanningPage seedProfiles={customSeedProfiles} />}
        />
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
              handleEditPotById={handleEditPotById}
            />
          }
        />
        <Route
          path="/pot/:potId/edit"
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
              handleEditPotById={handleEditPotById}
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
              loadSeedProfilePhotos={loadSeedProfilePhotos}
            />
          }
        />
        <Route
          path="/seeds/edit/:seedProfileId"
          element={
            <SeedFormPage
              newSeedProfile={newSeedProfile}
              handleSeedProfileChange={handleSeedProfileChange}
              handleAddSeedProfile={handleAddSeedProfile}
              editingSeedProfileId={editingSeedProfileId}
              formError={formError}
              loadSeedProfilePhotos={loadSeedProfilePhotos}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
