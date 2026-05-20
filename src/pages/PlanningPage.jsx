// src/pages/PlanningPage.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { months, monthLabels } from "../constants/months";

function PlanningPage({ seedProfiles }) {
  const [planningFilter, setPlanningFilter] = useState("all");
  const [planningSearch, setPlanningSearch] = useState("");

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

  function hasPlanningType(profile, type) {
    if (type === "sowing") {
      return Boolean(profile.sowingFromMonth && profile.sowingToMonth);
    }

    if (type === "outdoor") {
      return Boolean(profile.outdoorFromMonth && profile.outdoorToMonth);
    }

    if (type === "harvest") {
      return Boolean(profile.harvestFromMonth && profile.harvestToMonth);
    }

    return true;
  }

  function getPlanningMarkers(profile, month) {
    const markers = [];

    if (
      planningFilter !== "outdoor" &&
      planningFilter !== "harvest" &&
      isMonthInRange(month, profile.sowingFromMonth, profile.sowingToMonth)
    ) {
      markers.push("A");
    }

    if (
      planningFilter !== "sowing" &&
      planningFilter !== "harvest" &&
      isMonthInRange(month, profile.outdoorFromMonth, profile.outdoorToMonth)
    ) {
      markers.push("D");
    }

    if (
      planningFilter !== "sowing" &&
      planningFilter !== "outdoor" &&
      isMonthInRange(month, profile.harvestFromMonth, profile.harvestToMonth)
    ) {
      markers.push("E");
    }

    return markers;
  }

  const filteredPlanningProfiles = activeSeedProfiles.filter((profile) => {
    const matchesFilter = hasPlanningType(profile, planningFilter);

    const searchText = [
      profile.plantName,
      profile.variety,
      profile.manufacturer,
      profile.retailer,
      profile.id,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(planningSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container">
      <h1>Pflanzplanung 🌱</h1>

      <div className="page-actions button-row">
        <Link to="/" className="button-link">
          ← Zur Übersicht
        </Link>
      </div>

      <section className="card planning-intro-card">
        <h2>Planung für die nächste Saison</h2>

        <p>
          Diese Übersicht zeigt alle aktiven Samenprofile als Monatsplanung.
          Markiert werden Aussaat, Auspflanzen nach draußen und Ernte. Über den
          Pflanzennamen, die Profil-ID oder eine Monatsmarkierung gelangst du
          direkt zum passenden Samenprofil.
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
        <h2>Filter</h2>

        <div className="planning-filter-bar">
          <button
            type="button"
            className={`button ${
              planningFilter === "all" ? "filter-active" : ""
            }`}
            onClick={() => setPlanningFilter("all")}
          >
            Alle
          </button>

          <button
            type="button"
            className={`button ${
              planningFilter === "sowing" ? "filter-active" : ""
            }`}
            onClick={() => setPlanningFilter("sowing")}
          >
            Aussaat
          </button>

          <button
            type="button"
            className={`button ${
              planningFilter === "outdoor" ? "filter-active" : ""
            }`}
            onClick={() => setPlanningFilter("outdoor")}
          >
            Nach draußen
          </button>

          <button
            type="button"
            className={`button ${
              planningFilter === "harvest" ? "filter-active" : ""
            }`}
            onClick={() => setPlanningFilter("harvest")}
          >
            Ernte
          </button>
        </div>

        <div className="planning-search">
          <label>Suche</label>
          <input
            type="text"
            value={planningSearch}
            onChange={(event) => setPlanningSearch(event.target.value)}
            placeholder="Pflanze, Sorte, Hersteller oder Profil-ID suchen..."
          />
        </div>

        <p className="planning-result-count">
          Angezeigte Samenprofile:{" "}
          <strong>{filteredPlanningProfiles.length}</strong>
        </p>
      </section>

      <section className="card planning-card">
        <h2>Jahresübersicht</h2>

        {filteredPlanningProfiles.length === 0 && (
          <p>Für den aktuellen Filter sind keine Samenprofile vorhanden.</p>
        )}

        {filteredPlanningProfiles.length > 0 && (
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
                {filteredPlanningProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      <Link
                        to={`/seeds/edit/${profile.id}?back=planning`}
                        className="planning-profile-link"
                      >
                        <strong>{profile.plantName || "-"}</strong>
                        <br />
                        <small>{profile.id}</small>
                      </Link>
                    </td>

                    <td>{profile.variety || "-"}</td>

                    {months.map((month) => {
                      const markers = getPlanningMarkers(profile, month.value);

                      return (
                        <td key={`${profile.id}-${month.value}`}>
                          {markers.length > 0 ? (
                            <Link
                              to={`/seeds/edit/${profile.id}?back=planning`}
                              className="planning-marker-link"
                              title={`${profile.plantName || profile.id} öffnen`}
                            >
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
                            </Link>
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

        {filteredPlanningProfiles.length === 0 && (
          <p>Für den aktuellen Filter sind keine Samenprofile vorhanden.</p>
        )}

        {filteredPlanningProfiles.length > 0 && (
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
                {filteredPlanningProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      <Link
                        to={`/seeds/edit/${profile.id}?back=planning`}
                        className="planning-profile-link"
                      >
                        <strong>{profile.plantName || "-"}</strong>
                      </Link>
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
                      <Link
                        to={`/seeds/edit/${profile.id}?back=planning`}
                        className="planning-profile-link"
                      >
                        <span className="pot-profile-badge">{profile.id}</span>
                      </Link>
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
