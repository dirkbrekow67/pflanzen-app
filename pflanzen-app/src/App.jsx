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
  });

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
    if (!formData.plantName) return;

    const newPot = {
      id: "TOPF-" + (pots.length + 1).toString().padStart(3, "0"),
      plantName: formData.plantName,
      sowingDate: formData.sowingDate || new Date().toLocaleDateString(),
      sowingDepthCm: Number(formData.sowingDepthCm),
      germinationTempMin: Number(formData.germinationTempMin),
      germinationTempMax: Number(formData.germinationTempMax),
      germinationDaysMin: Number(formData.germinationDaysMin),
      germinationDaysMax: Number(formData.germinationDaysMax),
      outdoorFromMonth: "Mai",
      outdoorToMonth: "Juli",
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
    });
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pflanzen App 🌱</h1>
      <p>Meine ersten Töpfe</p>
      <PotForm
        formData={formData}
        handleFormChange={handleFormChange}
        handleAddPot={handleAddPot}
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
