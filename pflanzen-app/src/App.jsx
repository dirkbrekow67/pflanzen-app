// 1. externe Bibliotheken
import { useEffect, useState } from "react";
// 2. interne Komponenten
import PotCard from "./components/PotCard";
import PotDetails from "./components/PotDetails";
import PotForm from "./components/PotForm";
// 3. Daten / Assets
import initialPots from "./data/pots.json";
import {
  addMissingStatus,
  buildPotData,
  clearedPotData,
  emptyFormData,
} from "./utils/potHelpers.js";
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

  const [selectedPot, setSelectedPot] = useState(null);

  // Enthält die aktuellen Eingabewerte des Formulars
  const [formData, setFormData] = useState(emptyFormData);

  const [formError, setFormError] = useState("");

  // Merkt, welche Töpfe aktuell angezeigt werden sollen: alle, belegte oder leere
  const [statusFilter, setStatusFilter] = useState("all");

  // Erstellt aus allen Töpfen die Liste, die zum aktuellen Filter passt
  const filteredPots = pots.filter((pot) => {
    // Bei "all" werden ale Töpfe angezeigt
    if (statusFilter === "all") {
      return true;
    }
    // Fehlender Status wird wie "active" behandelt
    const effectiveStatus = pot.status || "active";
    // Bei "active" oder "empty" werden nur passende Töpfe angezeigt
    return effectiveStatus === statusFilter;
  });

  // Topf wird ausgewählt und in Detailansicht angezeigt
  function handleSelectedPot(pot) {
    setSelectedPot(pot);
  }

  // Daten werden in das Formular eingegeben und in formData gespeichert
  function handleFormChange(field, value) {
    setFormData({
      ...formData,
      [field]: value,
    });
  }

  // Leert einen vorhandenen Topf, ohne seine IDzu verändern
  function handleClearPot(potId) {
    // die bestehende Topf-Liste wird durchlaufen
    const clearedPots = pots.map((pot) =>
      // Wenn die ID passt, bleiben ID und Topf erhalten,
      // aber die Inhaltlichen Felder werden auf Standardwerte zurückgesetzt

      pot.id === potId ? { ...pot, ...clearedPotData } : pot,
    );

    // Die aktualisierte Liste wird im State gespeichert
    setPots(clearedPots);

    // Der geleerte Topf wird erneut aus der neuen Liste geholt,
    // damit die Detailansicht sofort den aktuellen Stand zeigt.
    const clearedSelectedPot = clearedPots.find((pot) => pot.id === potId);
    setSelectedPot(clearedSelectedPot);

    // Falls gerade ein Bearbeiten-Modus aktiv war, wird er beendet
    setEditingPotId(null);

    // Fehlermeldungen werden gelöscht
    setFormError("");
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

    // Prüfung: Der Startmonat für "nach draußen" darf nicht nach dem Endmonat liegen
    if (Number(formData.outdoorFromMonth) > Number(formData.outdoorToMonth)) {
      setFormError(
        "Der Zeitraum 'nach draußen' ist ungültig: Von-Monat darf nicht nach dem Bis-Monat liegen.",
      );
      return;
    }
    // Alte Fehlermeldung wird gelöscht
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
      // Den gerade bearbeiteten Topf erneut aus der aktualisierten Liste holen
      const updatedSelectedPot = updatedPots.find(
        (pot) => pot.id === editingPotId,
      );
      // Die Detailansicht auf den neu aktualisierten Topf setzen
      setSelectedPot(updatedSelectedPot);
    } else {
      // Wenn kein Bearbeiten aktiv ist, wird ein neuer Topf angelegt
      const newPot = {
        // Neuer Topf mit freier Nummer wird angelegt
        id: "TOPF-" + (pots.length + 1).toString().padStart(3, "0"),
        ...potData,
      };
      // Der neue Topf wird an die bestehende Topf-Liste angehängt
      setPots([...pots, newPot]);
      // Der neu angelegte Topf wird direkt ausgewählt und in der Detailansicht angezeigt
      setSelectedPot(newPot);
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
      plantName: pot.plantName,
      lifecycle: pot.lifecycle,
      germinationTempMin: pot.germinationTempMin,
      germinationTempMax: pot.germinationTempMax,
      germinationDaysMin: pot.germinationDaysMin,
      germinationDaysMax: pot.germinationDaysMax,
      sowingDepthCm: pot.sowingDepthCm,
      sowingDate: pot.sowingDate,
      outdoorFromMonth: pot.outdoorFromMonth,
      outdoorToMonth: pot.outdoorToMonth,
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

  return (
    <div className="container">
      <h1>Pflanzen App 🌱</h1>
      <p>Meine ersten Töpfe</p>
      <PotForm
        formData={formData}
        handleFormChange={handleFormChange}
        handleAddPot={handleAddPot}
        formError={formError}
        editingPotId={editingPotId}
      />
      <div className="filter-bar">
        {/* Zeigt alle Töpfe an */}
        <button
          className={`button ${statusFilter === "all" ? "filter-active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          Alle
        </button>

        {/* Zeigt nur belegte Töpfe an */}
        <button
          className={`button ${statusFilter === "active" ? "filter-active" : ""}`}
          onClick={() => setStatusFilter("active")}
        >
          Belegt
        </button>

        {/* Zeigt nur leere Töpfe an */}
        <button
          className={`button ${statusFilter === "empty" ? "filter-active" : ""}`}
          onClick={() => setStatusFilter("empty")}
        >
          Leer
        </button>
      </div>
      {filteredPots.length === 0 && (
        <p>Für den aktuellen Filter sind keine Töpfe vorhanden.</p>
      )}

      {filteredPots.map((pot) => (
        <PotCard
          key={pot.id}
          id={pot.id}
          plantName={pot.plantName}
          sowingDate={pot.sowingDate}
          status={pot.status}
          onSelect={() => handleSelectedPot(pot)}
          isSelected={selectedPot?.id === pot.id}
        />
      ))}
      <hr style={{ margin: "24px 0" }} />
      <PotDetails
        pot={selectedPot}
        onEditPot={handleEditPot}
        onClearPot={handleClearPot}
      />
    </div>
  );
}

export default App;
