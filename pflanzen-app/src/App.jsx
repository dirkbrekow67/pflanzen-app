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
  const [newPlantName, setNewPlantName] = useState("");
  const [newLifecycle, setNewLifecycle] = useState("annual");
  const [newGerminationTempMin, setNewGerminationTempMin] = useState(10);
  const [newGerminationTempMax, setNewGerminationTempMax] = useState(20);
  const [newGerminationDaysMin, setNewGerminationDaysMin] = useState(10);
  const [newGerminationDaysMax, setNewGerminationDaysMax] = useState(20);
  const [newSowingDepthCm, setNewSowingDepthCm] = useState(1);
  const [newSowingDate, setNewSowingDate] = useState("");

  function handleSelectedPot(pot) {
    setSelectedPot(pot);
  }

  function handleAddPot() {
    if (!newPlantName) return;

    const newPot = {
      id: "TOPF-" + (pots.length + 1).toString().padStart(3, "0"),
      plantName: newPlantName,
      sowingDate: newSowingDate || new Date().toLocaleDateString(),
      sowingDepthCm: Number(newSowingDepthCm),
      germinationTempMin: Number(newGerminationTempMin),
      germinationTempMax: Number(newGerminationTempMax),
      germinationDaysMin: Number(newGerminationDaysMin),
      germinationDaysMax: Number(newGerminationDaysMax),
      outdoorFromMonth: "Mai",
      outdoorToMonth: "Juli",
      lifecycle: newLifecycle,
    };
    setPots([...pots, newPot]);
    setNewPlantName("");
    setNewLifecycle("annual");
    setNewGerminationTempMin(10);
    setNewGerminationTempMax(20);
    setNewGerminationDaysMin(10);
    setNewGerminationDaysMax(20);
    setNewSowingDepthCm(1);
    setNewSowingDate("");
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pflanzen App 🌱</h1>
      <p>Meine ersten Töpfe</p>
      <PotForm
        newPlantName={newPlantName}
        setNewPlantName={setNewPlantName}
        newLifecycle={newLifecycle}
        setNewLifecycle={setNewLifecycle}
        newGerminationTempMin={newGerminationTempMin}
        setNewGerminationTempMin={setNewGerminationTempMin}
        newGerminationTempMax={newGerminationTempMax}
        setNewGerminationTempMax={setNewGerminationTempMax}
        newGerminationDaysMin={newGerminationDaysMin}
        setNewGerminationDaysMin={setNewGerminationDaysMin}
        newGerminationDaysMax={newGerminationDaysMax}
        setNewGerminationDaysMax={setNewGerminationDaysMax}
        newSowingDepthCm={newSowingDepthCm}
        setNewSowingDepthCm={setNewSowingDepthCm}
        newSowingDate={newSowingDate}
        setNewSowingDate={setNewSowingDate}
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
