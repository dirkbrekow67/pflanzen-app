// src/pages/PlanningPage.jsx

import { Link } from "react-router-dom";
import { months, monthLabels } from "../constants/months";

function PlanningPage({ seedProfiles }) {
  const activeSeedProfiles = (seedProfiles || []).filter(
    (profile) => profile.profileStatus !== "nicht-brauchbar",
  );

  function isMonthInRange(month, fromMonth, toMonth) {
    if (!fromMonth || !toMonth) return false;

    const from = Number(fromMonth);
    const to = Number(toMonth);

    if (from <= to) {
      return month >= from && month <= to;
    }

    return month >= from || month <= to;
  }

  function getPlanningMarkers(profile, month) {
    const markers = [];

    if (isMonthInRange(month, profile.sowingFromMonth, profile.sowingToMonth)) {
      markers.push("A");
    }

    if (
      isMonthInRange(month, profile.outdoorFromMonth, profile.outdoorToMonth)
    ) {
      markers.push("D");
    }

    if (
      isMonthInRange(month, profile.harvestFromMonth, profile.harvestToMonth)
    ) {
      markers.push("E");
    }

    return markers;
  }

  return (
    <div className="container">
      <h1>Pflanzplanung 🌱</h1>

      <div className="page-actions">
        <Link to="/" className="button-link">
          ← Zur Übersicht
        </Link>
      </div>

      <section className="card planning-intro-card">
        <h2>Planung für die nächste Saison</h2>

        <p>
          Diese Übersicht zeigt alle aktiven Samenprofile als Monatsplanung.
          Markiert werden Aussaat, Auspflanzen nach draußen und Ernte.
        </p>

        <div className="planning-legend">
          <span>
            <strong>A</strong> Aussaat
          </span>
          <span>
            <strong>D</strong> Nach draußen
          </span>
          <span>
            <strong>E</strong> Ernte
          </span>
        </div>
      </section>

      <section className="card planning-card">
        <h2>Jahresübersicht</h2>

        {activeSeedProfiles.length === 0 && (
          <p>
            Es sind noch keine aktiven Samenprofile für die Planung vorhanden.
          </p>
        )}

        {activeSeedProfiles.length > 0 && (
          <div className="planning-table-wrapper">
            <table className="planning-table planning-month-table">
              <thead>
                <tr>
                  <th>Pflanze</th>
                  <th>Sorte</th>
                  {months.map((month) => (
                    <th key={month.value}>{month.label.slice(0, 3)}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {activeSeedProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      <strong>{profile.plantName || "-"}</strong>
                      <br />
                      <small>{profile.id}</small>
                    </td>

                    <td>{profile.variety || "-"}</td>

                    {months.map((month) => {
                      const markers = getPlanningMarkers(profile, month.value);

                      return (
                        <td key={`${profile.id}-${month.value}`}>
                          {markers.length > 0 ? (
                            <div className="planning-marker-list">
                              {markers.map((marker) => (
                                <span
                                  key={marker}
                                  className={`planning-marker planning-marker-${marker.toLowerCase()}`}
                                >
                                  {marker}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card planning-card">
        <h2>Samenprofile nach Planungsdaten</h2>

        {activeSeedProfiles.length === 0 && (
          <p>
            Es sind noch keine aktiven Samenprofile für die Planung vorhanden.
          </p>
        )}

        {activeSeedProfiles.length > 0 && (
          <div className="planning-table-wrapper">
            <table className="planning-table">
              <thead>
                <tr>
                  <th>Pflanze</th>
                  <th>Sorte</th>
                  <th>Aussaat</th>
                  <th>Nach draußen</th>
                  <th>Ernte</th>
                  <th>Profil</th>
                </tr>
              </thead>

              <tbody>
                {activeSeedProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      <strong>{profile.plantName || "-"}</strong>
                    </td>

                    <td>{profile.variety || "-"}</td>

                    <td>
                      {monthLabels[profile.sowingFromMonth] || "-"} bis{" "}
                      {monthLabels[profile.sowingToMonth] || "-"}
                    </td>

                    <td>
                      {monthLabels[profile.outdoorFromMonth] || "-"} bis{" "}
                      {monthLabels[profile.outdoorToMonth] || "-"}
                    </td>

                    <td>
                      {monthLabels[profile.harvestFromMonth] || "-"} bis{" "}
                      {monthLabels[profile.harvestToMonth] || "-"}
                    </td>

                    <td>
                      <span className="pot-profile-badge">{profile.id}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default PlanningPage;
