function PotCard({id, plantName, sowingDate}) {
  return (
    <div
      style={{
        border: '2px dashed green',
        padding: '12px',
        marginBottom: '12px',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <h2 style={{
        color: 'green',
        marginTop: 0
        }}>{id}</h2>
      <p>Pflanze: {plantName}</p>
      <p>Aussaatdatum: {sowingDate}</p>
    </div>
  )
}

export default PotCard