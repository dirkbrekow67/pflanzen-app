function App() {
  const pots = [
    { id: 'TOPF-001', plantName: 'Tomate', sowingDate: '12.04.2026' },
    { id: 'TOPF-002', plantName: 'Basilikum', sowingDate: '10.04.2026' },
    { id: 'TOPF-003', plantName: 'Paprika', sowingDate: '08.04.2026' },
  ]

  return (
    <div>
      <h1>Pflanzen App 🌱</h1>
      <p>Meine ersten Töpfe</p>

      {pots.map((pot) => (
        <div key={pot.id}>
          <h2>{pot.id}</h2>
          <p>Pflanze: {pot.plantName}</p>
          <p>Aussaatdatum: {pot.sowingDate}</p>
        </div>
      ))}
    </div>
  )
}

export default App