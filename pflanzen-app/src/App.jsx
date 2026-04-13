// 1. externe Bibliotheken
import { useState } from 'react'
// 2. interne Komponenten
import PotCard from './components/PotCard'
import PotDetails from './components/PotDetails'
// 3. Daten / Assets
import initialPots from './data/pots.json'
// 4. Styles (falls vorhanden)


function App() {
  const [pots, setPots] = useState(initialPots)
  const [selectedPot, setSelectedPot] = useState(null)
  const [newPlantName, setNewPlantName] = useState('')
  

  function handleSelectedPot(pot) {
    setSelectedPot(pot)
  }

    function handleAddPot() {
    if (!newPlantName) return

    const newPot = {
      id: 'Topf-' + (pots.length + 1).toString().padStart(3, '0'),
      plantName: newPlantName,
      sowingDate: new Date().toLocaleDateString(),
      sowingDepthCm: 1,
      germinationTempMin: 10,
      germinationTempMax: 20,
      germinationDaysMin: 10,
      germinationDaysMax: 20,
      outdoorFromMonth: 'Mai',
      outdoorToMonth: 'Juli',
      lifecycle: 'annual'
    }
    setPots([...pots, newPot])
    setNewPlantName('')
  } 

  return (
    <div style={{padding: '20px'}}>
      <h1>Pflanzen App 🌱</h1>
      <p>Meine ersten Töpfe</p>

      <input
      type='text'
      placeholder='Pflanzenname'
      value={newPlantName}
      onChange={(e) => setNewPlantName(e.target.value)}
      />

      <button onClick={handleAddPot}Hinzufügen></button>

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
      <hr style={{margin: '24px 0'}}/>

      <PotDetails pot={selectedPot} />
      </div>
  )
}

export default App