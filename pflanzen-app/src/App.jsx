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
  //Laden der Töpfe aus localStorage
  // Falls ältere Datensätze noch keinen Status haben, wird dieser ergänzt.
  const [pots, setPots] = useState(() => {
    const savedPots = localStorage.getItem("pots");
    if (savedPots) {
      try {
        return addMissingStatus(JSON.parse(savedPots));
      } catch (error) {
        console.error("Fehler beim Laden der gespeicherten Töpfe:", error);
        return addMissingStatus(initialPots);
      }
    }
    return addMissingStatus(initialPots);
  });

  // Immer wenn sich pots ändert, werden die aktuellen Daten im localStorage gespeichert
  useEffect(() => {
    localStorage.setItem("pots", JSON.stringify(pots));
  }, [pots]);

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
        id: "TOPF-" + (pots.length + 1).toString().padStart(3, "0"),
        ...potData,
      };
      // Der neue Topf wird an die bestehende Topf-Liste angehängt
      setPots([...pots, newPot]);
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
      outdoorFromMonth: pot.outdoorFromMonth,
      outdoorToMonth: pot.outdoorToMonth,
      seedProfileId: pot.seedProfileId || "",
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
    const selectedSeedProfile = seedProfiles.find(
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
      const nextNumber = pots.length + index + 1;

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
      };
    });

    setPots([...pots, ...newEmptyPots]);
    setEmptyPotCount(1);
    setFormError("");
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
            seedProfiles={seedProfiles}
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
      <Route path="/seeds" element={<SeedLibraryPage />} />
    </Routes>
  );
}

export default App;
