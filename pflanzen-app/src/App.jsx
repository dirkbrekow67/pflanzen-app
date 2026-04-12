import PotCard from './components/PotCard'

function App() {
  const pots = [
    { id: 'TOPF-001', plantName: 'Tomate', sowingDate: '12.04.2026' },
    { id: 'TOPF-002', plantName: 'Basilikum', sowingDate: '10.04.2026' },
    { id: 'TOPF-003', plantName: 'Paprika', sowingDate: '08.04.2026' },
  ]

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