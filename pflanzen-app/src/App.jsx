// 1. externe Bibliotheken
import { useState } from 'react'
// 2. interne Komponenten
import PotCard from './components/PotCard'
// 3. Daten / Assets
import pots from './data/pots.json'
// 4. Styles (falls vorhanden)


function App() {
  const [selectedPot, setSelectedPot] = useState(null)

  function handleSelectedPot(pot) {
    setSelectedPot(pot)
  }
  return (
    <div style={{padding: '20px'}}>
      <h1>Pflanzen App 🌱</h1>
      <p>Meine ersten Töpfe</p>

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

      <h2>Ausgewählter Pot</h2>

      {selectedPot ? (
        <div>
          <p><strong>ID:</strong> {selectedPot.id}</p>
          <p><strong>Pflanze:</strong> {selectedPot.plantName}</p>
          <p><strong>Aussaatdatum</strong> {selectedPot.sowingDate}</p>
        </div>
      ) : (
        <p>Bite wähle einen Topf aus.</p>
      )}
    </div>
  )
}

export default App