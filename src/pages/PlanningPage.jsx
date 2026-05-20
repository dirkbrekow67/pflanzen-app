// src/pages/PlanningPage.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { months, monthLabels } from "../constants/months";

function PlanningPage({ seedProfiles }) {
  const [planningFilter, setPlanningFilter] = useState("all");
  const [planningSearch, setPlanningSearch] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [showPlanningDetails, setShowPlanningDetails] = useState(false);

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

  function sortProfilesByPlantName(a, b) {
    const plantCompare = (a.profile.plantName || "").localeCompare(
      b.profile.plantName || "",
      "de",
    );

    if (plantCompare !== 0) {
      return plantCompare;
    }

    const varietyCompare = (a.profile.variety || "").localeCompare(
      b.profile.variety || "",
      "de",
    );

    if (varietyCompare !== 0) {
      return varietyCompare;
    }

    return (a.profile.id || "").localeCompare(b.profile.id || "", "de");
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
      items: currentMonthProfiles
        .filter((item) => item.markers.includes("A"))
        .sort(sortProfilesByPlantName),
    },
    {
      marker: "D",
      title: "Nach draußen",
      items: currentMonthProfiles
        .filter((item) => item.markers.includes("D"))
        .sort(sortProfilesByPlantName),
    },
    {
      marker: "E",
      title: "Ernte",
      items: currentMonthProfiles
        .filter((item) => item.markers.includes("E"))
        .sort(sortProfilesByPlantName),
    },
  ].filter((group) => group.items.length > 0);

  function getMarkerLabel(marker) {
    if (marker === "A") return "Aussaat";
    if (marker === "D") return "Nach draußen";
    if (marker === "E") return "Ernte";

    return marker;
  }

  function getMarkerTitle(profile, month, markers) {
    const plantName = profile.plantName || profile.id || "Samenprofil";
    const monthLabel = monthLabels[month] || "Monat";
    const markerLabels = markers
      .map((marker) => getMarkerLabel(marker))
      .join(", ");

    return `${plantName} · ${monthLabel}: ${markerLabels}`;
  }

  function getPlanningFilterLabel() {
    if (planningFilter === "sowing") return "Aussaat";
    if (planningFilter === "outdoor") return "Nach draußen";
    if (planningFilter === "harvest") return "Ernte";

    return "Alle";
  }

  function getCurrentMonthCount(marker) {
    return currentMonthProfiles.filter((item) => item.markers.includes(marker))
      .length;
  }

  function getMarkersForMonth(profile, month) {
    return getPlanningMarkers(profile, month);
  }

  function hasAnyPlanningData(profile) {
    return Boolean(
      profile.sowingFromMonth ||
      profile.sowingToMonth ||
      profile.outdoorFromMonth ||
      profile.outdoorToMonth ||
      profile.harvestFromMonth ||
      profile.harvestToMonth,
    );
  }

  function formatMonthRange(fromMonth, toMonth) {
    if (!fromMonth && !toMonth) return "keine Angabe";

    return `${monthLabels[fromMonth] || "-"} bis ${monthLabels[toMonth] || "-"}`;
  }

  function renderMonthRange(fromMonth, toMonth) {
    const value = formatMonthRange(fromMonth, toMonth);

    if (value === "keine Angabe") {
      return <span className="planning-missing-value">keine Angabe</span>;
    }

    return value;
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
          Filter: <strong>{getPlanningFilterLabel()}</strong> · Monat:{" "}
          <strong>{currentMonthLabel}</strong> · Treffer:{" "}
          <strong>{filteredPlanningProfiles.length}</strong>
        </p>
      </section>

      <section className="card planning-card">
        <h2>Aktuell im {currentMonthLabel}</h2>

        <div className="planning-month-summary">
          <span className="planning-marker planning-marker-a">
            {getCurrentMonthCount("A")} Aussaat
          </span>

          <span className="planning-marker planning-marker-d">
            {getCurrentMonthCount("D")} Nach draußen
          </span>

          <span className="planning-marker planning-marker-e">
            {getCurrentMonthCount("E")} Ernte
          </span>
        </div>

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
                          Sorte: {profile.variety || "keine Angabe"} ·{" "}
                          {profile.id}
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
                      <button
                        type="button"
                        className="planning-month-header-button"
                        onClick={() => setSelectedMonth(month.value)}
                        title={`${month.label} als Planungsmonat anzeigen`}
                      >
                        {month.label.slice(0, 3)}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredPlanningProfiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className={
                      !hasAnyPlanningData(profile) ? "planning-row-muted" : ""
                    }
                  >
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
                              title={getMarkerTitle(
                                profile,
                                month.value,
                                markers,
                              )}
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
                            <span className="planning-empty-cell">–</span>
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
        <div className="planning-section-header">
          <h2>Detailübersicht</h2>

          <button
            type="button"
            className="button button-compact"
            onClick={() => setShowPlanningDetails((prev) => !prev)}
          >
            {showPlanningDetails ? "Details ausblenden" : "Details anzeigen"}
          </button>
        </div>

        {!showPlanningDetails && (
          <p className="planning-muted-text">
            Details zu Aussaat, Auspflanzen, Ernte und zum ausgewählten Monat
            können bei Bedarf eingeblendet werden.
          </p>
        )}

        {showPlanningDetails && (
          <>
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
                          {renderMonthRange(
                            profile.sowingFromMonth,
                            profile.sowingToMonth,
                          )}
                        </td>

                        <td>
                          {renderMonthRange(
                            profile.outdoorFromMonth,
                            profile.outdoorToMonth,
                          )}
                        </td>

                        <td>
                          {renderMonthRange(
                            profile.harvestFromMonth,
                            profile.harvestToMonth,
                          )}
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
                            <span className="pot-profile-badge">
                              {profile.id}
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default PlanningPage;
