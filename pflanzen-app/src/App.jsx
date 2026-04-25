// 1. externe Bibliotheken
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
// 2. interne Komponenten
import HomePage from "./pages/HomePage";
import PotPage from "./pages/PotPage";
import LabelPrintPage from "./pages/LabelPrintPage";
import SeedLibraryPage from "./pages/SeedLibraryPage";
// 3. Daten / Assets
import initialPots from "./data/pots.json";
import seedProfiles from "./data/seedProfiles.json";

import {
  addMissingStatus,
  buildPotData,
  clearedPotData,
  emptyFormData,
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

  const [customSeedProfiles, setCustomSeedProfiles] = useState(() => {
    const savedSeedProfiles = localStorage.getItem("seedProfiles");

    if (savedSeedProfiles) {
      try {
        return JSON.parse(savedSeedProfiles);
      } catch (error) {
        console.error("Fehler beim Laden der Samenprofile:", error);
        return seedProfiles;
      }
    }

    return seedProfiles;
  });

  const [newSeedProfile, setNewSeedProfile] = useState({
    plantName: "",
    variety: "",
    manufacturer: "",
    experience: "",
    profileStatus: "testen",
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
    profileNotes: "",
  });

  const [editingSeedProfileId, setEditingSeedProfileId] = useState(null);

  // Immer wenn sich pots ändert, werden die aktuellen Daten im localStorage gespeichert
  /*useEffect(() => {
    localStorage.setItem("pots", JSON.stringify(pots));
  }, [pots]);
  */
  useEffect(() => {
    localStorage.setItem("seedProfiles", JSON.stringify(customSeedProfiles));
  }, [customSeedProfiles]);

  // Daten werden in das Formular eingegeben und in formData gespeichert
  function handleFormChange(field, value) {
    setFormData({
      ...formData,
      [field]: value,
    });
  }

  // Leert einen vorhandenen Topf, ohne seine ID zu verändern
  function handleClearPot(potId) {
    // die bestehende Topf-Liste wird durchlaufen
    const clearedPots = pots.map((pot) =>
      // Wenn die ID passt, bleiben ID und Topf erhalten,
      // aber die Inhaltlichen Felder werden auf Standardwerte zurückgesetzt

      pot.id === potId ? { ...pot, ...clearedPotData } : pot,
    );

    // Die aktualisierte Liste wird im State gespeichert
    setPots(clearedPots);

    // Falls gerade ein Bearbeiten-Modus aktiv war, wird er beendet
    setEditingPotId(null);

    // Alte Fehlermeldungen werden gelöscht
    setFormError("");
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
  useEffect(() => {
    loadPots();
  }, []);

  // Speichert Formular-Daten: entweder als neuer Topf oder als Änderung an einem bestehenden Topf
  function handleAddPot() {
    const today = new Date().toISOString().split("T")[0];

    // Abfrage, ob Aussaatdatum in der Zukunft liegt, Zukunft momentan verboten
    if (formData.sowingDate && formData.sowingDate > today) {
      setFormError(
        "Das Aussaatdatum darf aktuell nicht in der Zukunft liegen.",
      );
      return;
    }

    // Leerzeichen vor und nach dem Pflanzennamen löschen. Leerzeichen zwischen den Namen bleiben z. B. "Petersilie (glatt)"
    if (!formData.plantName.trim()) {
      setFormError("Bitte einen Pflanzennamen eingeben!");
      return;
    }

    // Prüfung: Die minimale Keimtemperatur darf nicht größer sein als die maximale
    if (
      Number(formData.germinationTempMin) > Number(formData.germinationTempMax)
    ) {
      setFormError("Keimtemperatur min darf nicht größer als max sein.");
      return;
    }

    // Prüfung: Die minimale Keimdauer darf nicht größer sein als die maximale
    if (
      Number(formData.germinationDaysMin) > Number(formData.germinationDaysMax)
    ) {
      setFormError("Keimdauer min darf nicht größer als max sein!");
      return;
    }

    // Prüfung: Die Aussaattiefe darf nicht negativ sein
    if (Number(formData.sowingDepthCm) < 0) {
      setFormError("Aussaattiefe darf nicht negativ sein!");
      return;
    }
    // Prüfung: Der Aussaatzeitraum laut Packung muss logisch sein
    if (Number(formData.sowingFromMonth) > Number(formData.sowingToMonth)) {
      setFormError(
        "Der Aussaatzeitraum ist ungültig: Von-Monat darf nicht nach dem Bis-Monat liegen.",
      );
      return;
    }

    // Prüfung: Der Startmonat für "nach draußen" darf nicht nach dem Endmonat liegen
    if (Number(formData.outdoorFromMonth) > Number(formData.outdoorToMonth)) {
      setFormError(
        "Der Zeitraum 'nach draußen' ist ungültig: Von-Monat darf nicht nach dem Bis-Monat liegen.",
      );
      return;
    }
    // Alte Fehlermeldungen werden gelöscht
    setFormError("");

    // Gemeinsame Formulardaten für Neuanlage und Bearbeiten vorbereiten
    const potData = buildPotData(formData);
    /*
      Wenn editingPotId gesetzt ist, befindet sich die App im Bearbeiten-Modus.
      Dann wird kein neuer Topf angelegt, sondern ein vorhandener Topf aktualisiert.
    */
    if (editingPotId) {
      /*
      Die vorhandene Topf-Liste wird mit map() durchlaufen.
      Trifft die ID auf editingPotId, werden die alten Daten dieses Topfs durch potData ersetzt.
      Alle anderen Töpfe bleiben unverändert.
      */
      const updatedPots = pots.map((pot) =>
        pot.id === editingPotId ? { ...pot, ...potData } : pot,
      );

      // Die aktualisierte Topf-Liste wird im State gespeichert
      setPots(updatedPots);
    } else {
      // Wenn kein Bearbeiten aktiv ist, wird ein neuer Topf angelegt
      const newPot = {
        // Neuer Topf mit freier Nummer wird angelegt
        id: getNextPotId(),
        ...potData,
      };
      // Der neue Topf wird an die bestehende Topf-Liste angehängt
      fetch("http://localhost:3001/api/pots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPot),
      })
        .then((res) => res.json())
        .then(() => {
          loadPots();
        })
        .catch((err) => {
          console.error("Fehler beim Speichern des Topfs:", err);
          setFormError(
            "Topf konnte nicht in der Datenbank gespeichert werden.",
          );
        });
    }
    // Formular nach erfolgreichem Speichern wieder auf Standardwerte zurücksetzen
    setFormData(emptyFormData);

    // Bearbeiten-Modus beenden, damit das Formular wieder im Neuanlage-Modus ist
    setEditingPotId(null);
    setFormError("");
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
  function handleAddSeedProfile() {
    if (!newSeedProfile.plantName.trim()) {
      setFormError("Bitte einen Pflanzennamen für das Samenprofil eingeben.");
      return;
    }

    if (
      Number(newSeedProfile.sowingFromMonth) >
      Number(newSeedProfile.sowingToMonth)
    ) {
      setFormError("Der Aussaatzeitraum des Samenprofils ist ungültig.");
      return;
    }

    if (
      Number(newSeedProfile.germinationTempMin) >
      Number(newSeedProfile.germinationTempMax)
    ) {
      setFormError("Die Keimtemperatur des Samenprofils ist ungültig.");
      return;
    }

    if (
      Number(newSeedProfile.germinationDaysMin) >
      Number(newSeedProfile.germinationDaysMax)
    ) {
      setFormError("Die Keimdauer des Samenprofils ist ungültig.");
      return;
    }

    if (Number(newSeedProfile.sowingDepthCm) < 0) {
      setFormError(
        "Die Aussaattiefe des Samenprofils darf nicht negativ sein.",
      );
      return;
    }

    if (
      Number(newSeedProfile.outdoorFromMonth) >
      Number(newSeedProfile.outdoorToMonth)
    ) {
      setFormError(
        "Der Zeitraum 'nach draußen' des Samenprofils ist ungültig.",
      );
      return;
    }

    const profileData = {
      plantName: newSeedProfile.plantName,
      lifecycle: newSeedProfile.lifecycle,
      sowingFromMonth: Number(newSeedProfile.sowingFromMonth),
      sowingToMonth: Number(newSeedProfile.sowingToMonth),
      germinationTempMin: Number(newSeedProfile.germinationTempMin),
      germinationTempMax: Number(newSeedProfile.germinationTempMax),
      germinationDaysMin: Number(newSeedProfile.germinationDaysMin),
      germinationDaysMax: Number(newSeedProfile.germinationDaysMax),
      sowingDepthCm: Number(newSeedProfile.sowingDepthCm),
      outdoorFromMonth: Number(newSeedProfile.outdoorFromMonth),
      outdoorToMonth: Number(newSeedProfile.outdoorToMonth),
      variety: newSeedProfile.variety,
      manufacturer: newSeedProfile.manufacturer,
      experience: newSeedProfile.experience,
      profileStatus: newSeedProfile.profileStatus,
      profileNotes: newSeedProfile.profileNotes,
    };

    if (editingSeedProfileId) {
      const updatedProfiles = customSeedProfiles.map((profile) =>
        profile.id === editingSeedProfileId
          ? { ...profile, ...profileData }
          : profile,
      );

      setCustomSeedProfiles(updatedProfiles);
    } else {
      const newProfile = {
        id:
          "SEED-" + (customSeedProfiles.length + 1).toString().padStart(3, "0"),
        ...profileData,
      };

      setCustomSeedProfiles([...customSeedProfiles, newProfile]);
    }
    setNewSeedProfile({
      plantName: "",
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
      variety: "",
      manufacturer: "",
      experience: "",
      profileStatus: "testen",
      profileNotes: "",
    });

    setFormError("");
    setEditingSeedProfileId(null);
  }
  function handleEditSeedProfile(profile) {
    setNewSeedProfile({
      plantName: profile.plantName,
      variety: profile.variety || "",
      manufacturer: profile.manufacturer || "",
      experience: profile.experience || "",
      profileStatus: profile.profileStatus || "testen",
      lifecycle: profile.lifecycle,
      sowingFromMonth: profile.sowingFromMonth,
      sowingToMonth: profile.sowingToMonth,
      germinationTempMin: profile.germinationTempMin,
      germinationTempMax: profile.germinationTempMax,
      germinationDaysMin: profile.germinationDaysMin,
      germinationDaysMax: profile.germinationDaysMax,
      sowingDepthCm: profile.sowingDepthCm,
      outdoorFromMonth: profile.outdoorFromMonth,
      outdoorToMonth: profile.outdoorToMonth,
      profileNotes: profile.profileNotes || "",
    });

    setEditingSeedProfileId(profile.id);
  }
  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            formData={formData}
            handleFormChange={handleFormChange}
            handleAddPot={handleAddPot}
            formError={formError}
            editingPotId={editingPotId}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            filteredPots={filteredPots}
            selectedLabelIds={selectedLabelIds}
            handleToggleLabelSelection={handleToggleLabelSelection}
            seedProfiles={customSeedProfiles}
            selectedSeedProfileId={selectedSeedProfileId}
            setSelectedSeedProfileId={setSelectedSeedProfileId}
            handleApplySeedProfile={handleApplySeedProfile}
            handleExportPots={handleExportPots}
            emptyPotCount={emptyPotCount}
            setEmptyPotCount={setEmptyPotCount}
            handleAddEmptyPots={handleAddEmptyPots}
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
            seedProfiles={customSeedProfiles}
            newSeedProfile={newSeedProfile}
            handleSeedProfileChange={handleSeedProfileChange}
            handleAddSeedProfile={handleAddSeedProfile}
            editingSeedProfileId={editingSeedProfileId}
            handleEditSeedProfile={handleEditSeedProfile}
          />
        }
      />
    </Routes>
  );
}

export default App;
