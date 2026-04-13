function PotDetails({ pot }) {
    if (!pot) {
        return (
            <div>
                <h2>Ausgewählter Topf</h2>
                <p>Bitte wähle einen Topf aus.</p>
            </div>
        )
    }
    return (
        <div>
            <h2>Ausgewählter Topf</h2>
            <p><strong>ID:</strong> {pot.id}</p>
            <p><strong>Pflanze:</strong> {pot.plantName}</p>
            <p><strong>Aussaatdatum:</strong> {pot.sowingDate}</p>
        </div>
    )
}

export default PotDetails