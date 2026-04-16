// 1. externe Bibliotheken
import { useEffect, useState } from "react";
// 2. interne Komponenten
import PotCard from "./components/PotCard";
import PotDetails from "./components/PotDetails";
import PotForm from "./components/PotForm";
// 3. Daten / Assets
import initialPots from "./data/pots.json";
// 4. Styles (falls vorhanden)
import "./App.css";

function App() {
  const [pots, setPots] = useState(() => {
    const savedPots = localStorage.getItem("pots");
    if (savedPots) {
      try {
        return JSON.parse(savedPots);
      } catch (error) {
        console.error("Fehler beim Laden der gespeicherten Töpfe:", error);
        return initialPots;
      }
    }
    return initialPots;
  });

  useEffect(() => {
    localStorage.setItem("pots", JSON.stringify(pots));
  }, [pots]);
  const [editingPotId, setEditingPotId] = useState(null);

  const [selectedPot, setSelectedPot] = useState(null);
  const [formData, setFormData] = useState({
    plantName: "",
    lifecycle: "annual",
    germinationTempMin: 10,
    germinationTempMax: 20,
    germinationDaysMin: 10,
    germinationDaysMax: 20,
    sowingDepthCm: 1,
    sowingDate: "",
    outdoorFromMonth: 5,
    outdoorToMonth: 7,
  });
  const [formError, setFormError] = useState("");

  function handleSelectedPot(pot) {
    setSelectedPot(pot);
  }

  function handleFormChange(field, value) {
    setFormData({
      ...formData,
      [field]: value,
    });
  }

  function handleAddPot() {
    const today = new Date().toISOString().split("T")[0];

    if (formData.sowingDate && formData.sowingDate > today) {
      setFormError(
        "Das Aussaatdatum darf aktuell nicht in der Zukunft liegen.",
      );
      return;
    }

    if (!formData.plantName.trim()) {
      setFormError("Bitte einen Pflanzennamen eingeben!");
      return;
    }

    if (
      Number(formData.germinationTempMin) > Number(formData.germinationTempMax)
    ) {
      setFormError("Keimtemperatur min darf nicht größer als max sein.");
      return;
    }

    if (
      Number(formData.germinationDaysMin) > Number(formData.germinationDaysMax)
    ) {
      setFormError("Keimdauer min darf nicht größer als max sein!");
      return;
    }

    if (Number(formData.sowingDepthCm) < 0) {
      setFormError("Aussaattiefe darf nicht negativ sein!");
      return;
    }

    if (Number(formData.outdoorFromMonth) > Number(formData.outdoorToMonth)) {
      setFormError(
        "Der Zeitraum 'nach draußen' ist ungültig: Von-Monat darf nicht nach dem Bis-Monat liegen.",
      );
      return;
    }

    setFormError("");

    const potData = {
      plantName: formData.plantName,
      sowingDate: formData.sowingDate || new Date().toISOString().split("T")[0],
      sowingDepthCm: Number(formData.sowingDepthCm),
      germinationTempMin: Number(formData.germinationTempMin),
      germinationTempMax: Number(formData.germinationTempMax),
      germinationDaysMin: Number(formData.germinationDaysMin),
      germinationDaysMax: Number(formData.germinationDaysMax),
      outdoorFromMonth: Number(formData.outdoorFromMonth),
      outdoorToMonth: Number(formData.outdoorToMonth),
      lifecycle: formData.lifecycle,
    };

    if (editingPotId) {
      const updatedPots = pots.map((pot) =>
        pot.id === editingPotId ? { ...pot, ...potData } : pot,
      );

      setPots(updatedPots);

      const updatedSelectedPot = updatedPots.find(
        (pot) => pot.id === editingPotId,
      );
      setSelectedPot(updatedSelectedPot);
    } else {
      const newPot = {
        id: "TOPF-" + (pots.length + 1).toString().padStart(3, "0"),
        ...potData,
      };

      setPots([...pots, newPot]);
      setSelectedPot(newPot);
    }
    setFormData({
      plantName: "",
      lifecycle: "annual",
      germinationTempMin: 10,
      germinationTempMax: 20,
      germinationDaysMin: 10,
      germinationDaysMax: 20,
      sowingDepthCm: 1,
      sowingDate: "",
      outdoorFromMonth: 5,
      outdoorToMonth: 7,
    });
    setEditingPotId(null);
    setFormError("");
  }

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
    setEditingPotId(pot.id);
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
      {pots.map((pot) => (
        <PotCard
          key={pot.id}
          id={pot.id}
          plantName={pot.plantName}
          sowingDate={pot.sowingDate}
          onSelect={() => handleSelectedPot(pot)}
          isSelected={selectedPot?.id === pot.id}
        />
      ))}
      <hr style={{ margin: "24px 0" }} />
      <PotDetails pot={selectedPot} onEditPot={handleEditPot} />
    </div>
  );
}

export default App;
