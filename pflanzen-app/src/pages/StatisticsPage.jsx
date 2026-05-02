import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function StatisticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/statistics")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Statistik Fehler:", err));
  }, []);

  return (
    <div className="container">
      <h1>📊 Auswertung</h1>

      <div style={{ marginBottom: "16px" }}>
        <Link to="/" className="button-link">
          ← Zur Hauptseite
        </Link>
      </div>

      {!stats ? (
        <p>Daten werden geladen...</p>
      ) : (
        <>
          <div className="card-light">
            <h2>Bestand</h2>
            <p>Aktive Töpfe: {stats.activePots}</p>
            <p>Freie Töpfe: {stats.emptyPots}</p>
          </div>

          <div className="card-light">
            <h2>Historie</h2>
            <p>Gesamt Einträge: {stats.historyCount}</p>
            <p>Geerntet: {stats.harvestedCount}</p>
            <p>Fehlgeschlagen: {stats.failedCount}</p>
          </div>

          <div className="card-light">
            <h2>Durchschnitt</h2>
            <p>Standzeit: {stats.averageDuration} Tage</p>
          </div>
          <div className="card-light">
            <h2>Ergebnisse je Samenprofil</h2>

            {!stats.profileSummary || stats.profileSummary.length === 0 ? (
              <p>Noch keine auswertbaren Samenprofil-Ergebnisse vorhanden.</p>
            ) : (
              stats.profileSummary.map((item) => (
                <div
                  key={item.seedProfileId}
                  className="card-light history-card"
                >
                  <p>
                    <strong>
                      {item.plantName || item.seedProfileId}
                      {item.variety ? ` – ${item.variety}` : ""}
                      {item.manufacturer ? ` – ${item.manufacturer}` : ""}
                    </strong>
                  </p>

                  <p>Durchgänge: {item.total}</p>
                  <p>Erfolgreich/geerntet: {item.successful}</p>
                  <p>Fehlgeschlagen: {item.failed}</p>
                  <p>Sonstige Gründe: {item.other}</p>
                  <p>Erfolgsquote: {item.successRate} %</p>
                </div>
              ))
            )}
          </div>
          <div className="card-light">
            <h2>Top Samenprofile</h2>

            {!stats.topProfiles || stats.topProfiles.length === 0 ? (
              <p>Noch nicht genügend Daten für Top-Ergebnisse vorhanden.</p>
            ) : (
              stats.topProfiles.map((item) => (
                <div
                  key={item.seedProfileId}
                  className="card-light history-card"
                >
                  <p>
                    <strong>
                      {item.plantName || item.seedProfileId}
                      {item.variety ? ` – ${item.variety}` : ""}
                      {item.manufacturer ? ` – ${item.manufacturer}` : ""}
                    </strong>
                  </p>

                  <p>Erfolgsquote: {item.successRate} %</p>
                  <p>Durchgänge: {item.total}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StatisticsPage;
