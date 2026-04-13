function PotCard({id, plantName, sowingDate, onSelect, isSelected}) {
  return (
    <div
        onClick={onSelect}
      style={{
        border: isSelected ? '3px solid darkgreen' : '2px dashed green',
        padding: '12px',
        marginBottom: '12px',
        borderRadius: '8px',
        backgroundColor: isSelected ? '#dff5df' : '#f9f9f9',
        cursor: 'pointer',
      }}
    >
      <h2 style={{
        color: 'green',
        marginTop: 0}}
        >{id}</h2>
      <p>Pflanze: {plantName}</p>
      <p>Aussaatdatum: {sowingDate}</p>
      {isSelected && <p><strong>Ausgewählt</strong></p> }
    </div>
  )
}

export default PotCard