// 1. externe Bibliotheken
import { useState } from "react";
// 2. interne Komponenten
import PotCard from "./components/PotCard";
import PotDetails from "./components/PotDetails";
import PotForm from "./components/PotForm";
// 3. Daten / Assets
import initialPots from "./data/pots.json";
// 4. Styles (falls vorhanden)

function App() {
  const [pots, setPots] = useState(initialPots);
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
    outdoorFromMonth: "Mai",
    outdoorToMonth: "Juli",
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

    setFormError("");

    const newPot = {
      id: "TOPF-" + (pots.length + 1).toString().padStart(3, "0"),
      plantName: formData.plantName,
      sowingDate: formData.sowingDate || new Date().toLocaleDateString(),
      sowingDepthCm: Number(formData.sowingDepthCm),
      germinationTempMin: Number(formData.germinationTempMin),
      germinationTempMax: Number(formData.germinationTempMax),
      germinationDaysMin: Number(formData.germinationDaysMin),
      germinationDaysMax: Number(formData.germinationDaysMax),
      outdoorFromMonth: formData.outdoorFromMonth,
      outdoorToMonth: formData.outdoorToMonth,
      lifecycle: formData.lifecycle,
    };
    setPots([...pots, newPot]);
    setFormData({
      plantName: "",
      lifecycle: "annual",
      germinationTempMin: 10,
      germinationTempMax: 20,
      germinationDaysMin: 10,
      germinationDaysMax: 20,
      sowingDepthCm: 1,
      sowingDate: "",
      outdoorFromMonth: "Mai",
      outdoorToMonth: "Juni",
    });
    setFormError("");
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pflanzen App 🌱</h1>
      <p>Meine ersten Töpfe</p>
      <PotForm
        formData={formData}
        handleFormChange={handleFormChange}
        handleAddPot={handleAddPot}
        formError={formError}
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
      <PotDetails pot={selectedPot} />
    </div>
  );
}

export default App;
