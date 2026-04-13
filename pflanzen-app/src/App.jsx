// 1. externe Bibliotheken
import { useState } from 'react'
// 2. interne Komponenten
import PotCard from './components/PotCard'
import PotDetails from './components/PotDetails'
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

      <PotDetails pot={selectedPot} />
      </div>
  )
}

export default App