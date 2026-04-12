function PotCard(props) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '12px',
        marginBottom: '12px',
        borderRadius: '8px',
      }}
    >
      <h2>{props.id}</h2>
      <p>Pflanze: {props.plantName}</p>
      <p>Aussaatdatum: {props.sowingDate}</p>
    </div>
  )
}

export default PotCard