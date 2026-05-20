// src/pages/PlanningPage.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { months, monthLabels } from "../constants/months";

function PlanningPage({ seedProfiles }) {
  const [planningFilter, setPlanningFilter] = useState("all");
  const [planningSearch, setPlanningSearch] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

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

  function getEarliestPlanningMonth(profile) {
    const monthValues = [
      profile.sowingFromMonth,
      profile.outdoorFromMonth,
      profile.harvestFromMonth,
    ]
      .map((value) => Number(value))
      .filter((value) => value >= 1 && value <= 12);

    if (monthValues.length === 0) {
      return 99;
    }

    return Math.min(...monthValues);
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

  const filteredPlanningProfiles = activeSeedProfiles
    .filter((profile) => {
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
    })
    .sort((a, b) => {
      const monthCompare =
        getEarliestPlanningMonth(a) - getEarliestPlanningMonth(b);

      if (monthCompare !== 0) {
        return monthCompare;
      }

      const plantCompare = (a.plantName || "").localeCompare(
        b.plantName || "",
        "de",
      );

      if (plantCompare !== 0) {
        return plantCompare;
      }

      return (a.id || "").localeCompare(b.id || "", "de");
    });

  const currentMonthValue = selectedMonth;
  const currentMonthLabel =
    monthLabels[currentMonthValue] || "ausgewählter Monat";

  const currentMonthProfiles = filteredPlanningProfiles
    .map((profile) => ({
      profile,
      markers: getPlanningMarkers(profile, currentMonthValue),
    }))
    .filter((item) => item.markers.length > 0);

  const currentMonthGroups = [
    {
      marker: "A",
      title: "Aussaat",
      items: currentMonthProfiles.filter((item) => item.markers.includes("A")),
    },
    {
      marker: "D",
      title: "Nach draußen",
      items: currentMonthProfiles.filter((item) => item.markers.includes("D")),
    },
    {
      marker: "E",
      title: "Ernte",
      items: currentMonthProfiles.filter((item) => item.markers.includes("E")),
    },
  ].filter((group) => group.items.length > 0);

  function getMarkerLabel(marker) {
    if (marker === "A") return "Aussaat";
    if (marker === "D") return "Nach draußen";
    if (marker === "E") return "Ernte";

    return marker;
  }

  function getMarkersForMonth(profile, month) {
    return getPlanningMarkers(profile, month);
  }

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

        <div className="planning-filter-input-row">
          <div className="planning-search">
            <label>Suche</label>
            <input
              type="text"
              value={planningSearch}
              onChange={(event) => setPlanningSearch(event.target.value)}
              placeholder="Pflanze, Sorte, Hersteller oder Profil-ID suchen..."
            />
          </div>

          <div className="planning-search planning-month-select">
            <label>Planungsmonat</label>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="planning-result-count">
          Angezeigte Samenprofile:{" "}
          <strong>{filteredPlanningProfiles.length}</strong>
        </p>
      </section>

      <section className="card planning-card">
        <h2>Aktuell im {currentMonthLabel}</h2>

        {currentMonthProfiles.length === 0 && (
          <p>
            Für den aktuellen Monat sind nach dem aktuellen Filter keine
            Einträge vorhanden.
          </p>
        )}

        {currentMonthGroups.length > 0 && (
          <div className="planning-current-groups">
            {currentMonthGroups.map((group) => (
              <div key={group.marker} className="planning-current-group">
                <h3>
                  <span
                    className={`planning-marker planning-marker-${group.marker.toLowerCase()}`}
                  >
                    {group.title}
                  </span>
                </h3>

                <div className="planning-current-list">
                  {group.items.map(({ profile }) => (
                    <Link
                      key={`${group.marker}-${profile.id}`}
                      to={`/seeds/edit/${profile.id}?back=planning`}
                      className="planning-current-item"
                    >
                      <div>
                        <strong>{profile.plantName || "-"}</strong>
                        <br />
                        <small>
                          {profile.variety || "-"} · {profile.id}
                        </small>
                      </div>

                      <span
                        className={`planning-marker planning-marker-${group.marker.toLowerCase()}`}
                      >
                        {getMarkerLabel(group.marker)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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
                    <th
                      key={month.value}
                      className={
                        month.value === selectedMonth
                          ? "planning-selected-month"
                          : ""
                      }
                    >
                      {month.label.slice(0, 3)}
                    </th>
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
                        <td
                          key={`${profile.id}-${month.value}`}
                          className={
                            month.value === selectedMonth
                              ? "planning-selected-month"
                              : ""
                          }
                        >
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
                  <th>Im {currentMonthLabel}</th>
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
                      {(() => {
                        const monthMarkers = getMarkersForMonth(
                          profile,
                          selectedMonth,
                        );

                        if (monthMarkers.length === 0) {
                          return "-";
                        }

                        return (
                          <div className="planning-marker-list">
                            {monthMarkers.map((marker) => (
                              <span
                                key={marker}
                                className={`planning-marker planning-marker-${marker.toLowerCase()}`}
                              >
                                {getMarkerLabel(marker)}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
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
