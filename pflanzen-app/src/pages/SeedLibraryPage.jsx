import seedProfiles from "../data/seedProfiles.json";

const monthLabels = {
  1: "Januar",
  2: "Februar",
  3: "März",
  4: "April",
  5: "Mai",
  6: "Juni",
  7: "Juli",
  8: "August",
  9: "September",
  10: "Oktober",
  11: "November",
  12: "Dezember",
};

function SeedLibraryPage() {
  return (
    <div className="container">
      <h1>Samenbibliothek 🌿</h1>
      <p>Gespeicherte Pflanzen-Stammdaten</p>

      {seedProfiles.map((profile) => (
        <div key={profile.id} className="card-light">
          <h2 style={{ marginTop: 0 }}>{profile.plantName}</h2>

          <p>
            <strong>ID:</strong> {profile.id}
          </p>

          <p>
            <strong>Lebenszyklus:</strong>{" "}
            {profile.lifecycle === "annual"
              ? "Einjährig"
              : profile.lifecycle === "biennial"
                ? "Zweijährig"
                : "Mehrjährig"}
          </p>

          <p>
            <strong>Aussaat laut Packung:</strong>{" "}
            {monthLabels[profile.sowingFromMonth]} bis{" "}
            {monthLabels[profile.sowingToMonth]}
          </p>

          <p>
            <strong>Keimtemperatur:</strong> {profile.germinationTempMin} bis{" "}
            {profile.germinationTempMax} °C
          </p>

          <p>
            <strong>Keimdauer:</strong> {profile.germinationDaysMin} bis{" "}
            {profile.germinationDaysMax} Tage
          </p>

          <p>
            <strong>Aussaattiefe:</strong> {profile.sowingDepthCm} cm
          </p>

          <p>
            <strong>Nach draußen:</strong>{" "}
            {monthLabels[profile.outdoorFromMonth]} bis{" "}
            {monthLabels[profile.outdoorToMonth]}
          </p>
        </div>
      ))}
    </div>
  );
}

export default SeedLibraryPage;
