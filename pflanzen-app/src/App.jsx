// 1. externe Bibliotheken

// 2. interne Komponenten
import PotCard from './components/PotCard'
// 3. Daten / Assets
import pots from './data/pots.json'
// 4. Styles (falls vorhanden)


function App() {
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
        />
      ))}
    </div>
  )
}

export default App