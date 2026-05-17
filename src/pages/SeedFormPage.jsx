import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/appConfig";
import SeedForm from "../components/SeedForm";
import { getMonthValueByName } from "../constants/months";
import { COMMON_PLANT_NAMES } from "../constants/plants";

function SeedFormPage({
  newSeedProfile,
  handleSeedProfileChange,
  handleAddSeedProfile,
  editingSeedProfileId,
  formError,
  loadSeedProfilePhotos,
}) {
  const navigate = useNavigate();

  const [seedPhotoType, setSeedPhotoType] = useState("pack_front");
  const [seedPhotoMessage, setSeedPhotoMessage] = useState("");
  const [seedPhotos, setSeedPhotos] = useState([]);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState(null);
  const { seedProfileId } = useParams();

  const currentSeedProfileId = editingSeedProfileId || seedProfileId;

  useEffect(() => {
    if (!currentSeedProfileId) {
      setSeedPhotos([]);
      return;
    }

    fetch(`${API_BASE_URL}/api/seed-profile-photos/${currentSeedProfileId}`)
      .then((res) => res.json())
      .then((data) => setSeedPhotos(data))
      .catch((err) => console.error("Samenprofil-Fotos Fehler:", err));
  }, [currentSeedProfileId]);

  useEffect(() => {
    const hasProcessingPhoto = seedPhotos.some(
      (photo) => photo.ocrStatus === "processing",
    );

    if (!currentSeedProfileId || !hasProcessingPhoto) return;

    const timer = setInterval(() => {
      fetch(`${API_BASE_URL}/api/seed-profile-photos/${currentSeedProfileId}`)
        .then((res) => res.json())
        .then((data) => {
          setSeedPhotos(data);
          loadSeedProfilePhotos();
        })
        .catch((err) =>
          console.error("OCR-Status Aktualisierung Fehler:", err),
        );
    }, 1500);

    return () => clearInterval(timer);
  }, [currentSeedProfileId, seedPhotos, loadSeedProfilePhotos]);

  function getMonthValue(monthName) {
    return getMonthValueByName(monthName);
  }

  async function refreshSeedPhotos() {
    if (!currentSeedProfileId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/seed-profile-photos/${currentSeedProfileId}`,
      );

      const data = await response.json();

      setSeedPhotos(data);
    } catch (error) {
      console.error("Samenprofil-Fotos Fehler:", error);
    }
  }

  async function handleSaveStayOnPage() {
    const success = await handleAddSeedProfile(currentSeedProfileId, {
      stayOnPage: true,
    });

    if (success) {
      setSeedPhotoMessage("Samenprofil wurde gespeichert.");
    }
  }

  async function handleSaveAndGoBack() {
    const success = await handleAddSeedProfile(currentSeedProfileId, {
      stayOnPage: false,
    });

    if (success) {
      navigate("/seeds");
    }
  }

  async function handleSeedPhotoUpload(event) {
    const file = event.target.files[0];
    event.target.value = null;

    if (!file || !currentSeedProfileId) return;

    setSeedPhotoMessage("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("seedProfileId", currentSeedProfileId);
    formData.append("photoType", seedPhotoType);

    try {
      const response = await fetch(`${API_BASE_URL}/api/seed-profile-photos`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload fehlgeschlagen");
      }

      setSeedPhotoMessage("Packungsfoto wurde gespeichert.");
      setSeedPhotoType("pack_back");

      loadSeedProfilePhotos();

      await refreshSeedPhotos();
    } catch (error) {
      console.error("Samenprofil-Foto Upload Fehler:", error);
      setSeedPhotoMessage("Packungsfoto konnte nicht gespeichert werden.");
    }
  }

  async function handleDeleteSeedPhoto(photoId) {
    const confirmed = window.confirm("Packungsfoto wirklich löschen?");

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/seed-profile-photos/${photoId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Löschen fehlgeschlagen");
      }

      setSeedPhotoMessage("Packungsfoto wurde gelöscht.");

      loadSeedProfilePhotos();

      await refreshSeedPhotos();
    } catch (error) {
      console.error("Samenprofil-Foto Löschen Fehler:", error);
      setSeedPhotoMessage("Packungsfoto konnte nicht gelöscht werden.");
    }
  }

  async function handleStartOcr(photoId) {
    setSeedPhotoMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/seed-profile-photos/${photoId}/ocr`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "OCR konnte nicht gestartet werden");
      }

      setSeedPhotoMessage("Texterkennung wurde gestartet.");

      await refreshSeedPhotos();

      loadSeedProfilePhotos();
    } catch (error) {
      console.error("OCR Fehler:", error);
      setSeedPhotoMessage("OCR konnte nicht gestartet werden.");
    }
  }

  async function handleScanSeedPhoto(photoType) {
    if (!currentSeedProfileId) return;

    setSeedPhotoMessage("Scan wird gestartet...");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/scanner/seed-profile/${currentSeedProfileId}/scan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photoType }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scan fehlgeschlagen");
      }

      setSeedPhotoMessage("Scan wurde gespeichert.");
      setSeedPhotoType("pack_back");

      loadSeedProfilePhotos();

      await refreshSeedPhotos();
    } catch (error) {
      console.error("Scanner Fehler:", error);
      setSeedPhotoMessage("Scan konnte nicht durchgeführt werden.");
    }
  }

  function formatOcrStatus(status) {
    if (status === "processing") return "läuft";
    if (status === "done") return "abgeschlossen";
    if (status === "error") return "Fehler";

    return "vorbereitet";
  }

  function getParsedOcrData(photo) {
    if (!photo.ocrParsed) return null;

    try {
      return JSON.parse(photo.ocrParsed);
    } catch {
      return null;
    }
  }

  function hasProfileValue(value) {
    return value !== null && value !== undefined && value !== "";
  }

  function isEmptyNumberFieldValue(value) {
    return (
      value === null ||
      value === undefined ||
      value === "" ||
      Number(value) === 0
    );
  }

  function applyOcrValueIfEmpty(fieldName, ocrValue) {
    if (!hasProfileValue(ocrValue)) return;

    if (hasProfileValue(newSeedProfile[fieldName])) return;

    handleSeedProfileChange(fieldName, ocrValue);
  }

  function applyOcrLifecycleValue(ocrValue) {
    if (!hasProfileValue(ocrValue)) return;

    if (!newSeedProfile.lifecycle || newSeedProfile.lifecycle === "annual") {
      handleSeedProfileChange("lifecycle", ocrValue);
    }
  }

  function applyOcrNumberValueIfEmpty(fieldName, ocrValue) {
    if (!hasProfileValue(ocrValue)) return;

    if (!isEmptyNumberFieldValue(newSeedProfile[fieldName])) return;

    handleSeedProfileChange(fieldName, ocrValue);
  }

  function applyOcrRangeIfEmpty(minFieldName, maxFieldName, rangeValue) {
    const rangeParts = rangeValue?.replace(/\s/g, "").split("-") || [];
    const minValue = rangeParts[0] || "";
    const maxValue = rangeParts[1] || "";

    applyOcrNumberValueIfEmpty(minFieldName, minValue);
    applyOcrNumberValueIfEmpty(maxFieldName, maxValue);
  }

  return (
    <div className="container">
      <h1>Samenprofil anlegen / bearbeiten</h1>

      <div className="page-actions">
        <Link to="/seeds" className="button-link">
          ← Zur Samenbibliothek
        </Link>
      </div>

      <SeedForm
        formData={newSeedProfile}
        handleFormChange={handleSeedProfileChange}
        handleSubmit={
          currentSeedProfileId ? handleSaveStayOnPage : handleSaveAndGoBack
        }
        handleSubmitAndGoBack={
          currentSeedProfileId ? handleSaveAndGoBack : null
        }
        editingId={currentSeedProfileId}
        formError={formError}
      />

      {currentSeedProfileId ? (
        <div className="photo-upload seed-upload-section">
          <p className="hint">
            Optional: Foto der Samenpackung aufnehmen oder hochladen.
          </p>

          <p className="hint">
            Vorderseiten eignen sich vor allem zur Erkennung von Pflanzenname
            und Sorte. Rückseiten liefern meist die Angaben zu Aussaat, Keimung,
            Abständen, Ernte und Hinweisen.
          </p>

          <div className="seed-upload-controls">
            <div className="photo-type-select">
              <label>Packungsseite</label>
              <select
                value={seedPhotoType}
                onChange={(e) => setSeedPhotoType(e.target.value)}
              >
                <option value="pack_front">Vorderseite</option>
                <option value="pack_back">Rückseite</option>
              </select>
            </div>

            <div className="seed-upload-buttons">
              <label className="button-link photo-upload-button">
                Packungsfoto auswählen / hochladen
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSeedPhotoUpload}
                  hidden
                  disabled={!currentSeedProfileId}
                />
              </label>

              <label className="button-link photo-upload-button">
                Foto aufnehmen
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleSeedPhotoUpload}
                  hidden
                  disabled={!currentSeedProfileId}
                />
              </label>
              <button
                type="button"
                className="button-link photo-upload-button"
                onClick={() => handleScanSeedPhoto("pack_front")}
                disabled={!currentSeedProfileId}
              >
                Vorderseite scannen
              </button>

              <button
                type="button"
                className="button-link photo-upload-button"
                onClick={() => handleScanSeedPhoto("pack_back")}
                disabled={!currentSeedProfileId}
              >
                Rückseite scannen
              </button>
            </div>
          </div>

          {seedPhotoMessage && (
            <p className="photo-message">{seedPhotoMessage}</p>
          )}
        </div>
      ) : (
        <div className="photo-upload seed-upload-section">
          <p className="hint">
            Packungsfotos können nach dem ersten Speichern des Samenprofils
            ergänzt werden. Sie können später automatisch zur Datenerkennung
            genutzt werden.
          </p>
        </div>
      )}

      {seedPhotos.length > 0 && (
        <div className="photo-gallery">
          <h2>Packungsfotos</h2>

          <div className="photo-grid">
            {[...seedPhotos]

              .sort((a, b) => {
                if (a.photoType === b.photoType) return 0;

                if (a.photoType === "pack_front") return -1;

                if (b.photoType === "pack_front") return 1;

                return 0;
              })
              .map((photo) => (
                <div key={photo.id} className="photo-card">
                  <img
                    src={`${API_BASE_URL}/uploads/${
                      photo.previewFileName ||
                      photo.processedFileName ||
                      photo.fileName
                    }`}
                    alt={photo.originalName || "Samenpackung"}
                    className="clickable-photo"
                    onClick={() =>
                      setSelectedPhotoPreview({
                        src: `${API_BASE_URL}/uploads/${
                          photo.previewFileName || photo.fileName
                        }`,
                        title:
                          photo.photoType === "pack_back"
                            ? "Samenpackung Rückseite"
                            : "Samenpackung Vorderseite",
                      })
                    }
                  />

                  <p className="photo-date">
                    Hochgeladen am{" "}
                    {photo.uploadedAt
                      ? new Date(photo.uploadedAt).toLocaleDateString("de-DE")
                      : "-"}
                  </p>

                  <p>
                    {photo.photoType === "pack_back"
                      ? "Rückseite"
                      : "Vorderseite"}
                  </p>
                  <p
                    className={`photo-ocr-status ocr-status-${photo.ocrStatus || "pending"}`}
                  >
                    OCR-Status: {formatOcrStatus(photo.ocrStatus)}
                  </p>
                  {photo.ocrText && (
                    <pre className="ocr-text-preview">{photo.ocrText}</pre>
                  )}
                  {getParsedOcrData(photo) && (
                    <div className="ocr-parsed-preview">
                      <strong>
                        {photo.photoType === "pack_front"
                          ? "Erkannte Vorderseite:"
                          : "Erkannte Daten:"}
                      </strong>

                      <p>
                        OCR-Qualität:{" "}
                        <span
                          className={`ocr-score ${
                            (getParsedOcrData(photo).ocrScore ?? 0) >= 90
                              ? "ocr-score-good"
                              : (getParsedOcrData(photo).ocrScore ?? 0) >= 70
                                ? "ocr-score-medium"
                                : "ocr-score-bad"
                          }`}
                        >
                          {getParsedOcrData(photo).ocrScore ?? "-"} %
                        </span>
                      </p>

                      {photo.photoType === "pack_front" ? (
                        <>
                          <p>
                            Pflanze: {getParsedOcrData(photo).plantName || "-"}
                          </p>

                          <p>
                            Hersteller / Händler:{" "}
                            {[
                              getParsedOcrData(photo).manufacturer,
                              getParsedOcrData(photo).retailer,
                            ]
                              .filter(Boolean)
                              .join(" / ") || "-"}
                          </p>

                          {getParsedOcrData(photo).lifecycle && (
                            <p>
                              Lebenszyklus:{" "}
                              {getParsedOcrData(photo).lifecycle === "annual"
                                ? "Einjährig"
                                : getParsedOcrData(photo).lifecycle ===
                                    "biennial"
                                  ? "Zweijährig"
                                  : getParsedOcrData(photo).lifecycle ===
                                      "perennial"
                                    ? "Mehrjährig"
                                    : getParsedOcrData(photo).lifecycle}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          {getParsedOcrData(photo).warnings?.length > 0 && (
                            <div className="ocr-warning-box">
                              <strong>Hinweise zur OCR:</strong>
                              <ul>
                                {getParsedOcrData(photo).warnings.map(
                                  (warning) => (
                                    <li key={warning}>{warning}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                          <p>
                            Pflanze: {getParsedOcrData(photo).plantName || "-"}
                          </p>

                          <p>
                            Hersteller / Händler:{" "}
                            {[
                              getParsedOcrData(photo).manufacturer,
                              getParsedOcrData(photo).retailer,
                            ]
                              .filter(Boolean)
                              .join(" / ") || "-"}
                          </p>

                          <p>
                            Aussaat:{" "}
                            {getParsedOcrData(photo).sowingMonths || "-"}
                          </p>

                          <p>
                            Keimtemperatur:{" "}
                            {getParsedOcrData(photo).germinationTemp || "-"}
                          </p>

                          <p>
                            Reihenabstand:{" "}
                            {getParsedOcrData(photo).rowSpacingCm || "-"} cm
                          </p>

                          <p>
                            Pflanzenabstand:{" "}
                            {getParsedOcrData(photo).plantSpacingCm || "-"} cm
                          </p>

                          <p>
                            Ernte:{" "}
                            {getParsedOcrData(photo).harvestMonths || "-"}
                          </p>

                          <p>
                            Keimdauer:{" "}
                            {getParsedOcrData(photo).germinationDays || "-"}
                          </p>

                          <p>
                            Saattiefe:{" "}
                            {getParsedOcrData(photo).sowingDepth || "-"}
                          </p>

                          <p>
                            Aussaatbreite:{" "}
                            {getParsedOcrData(photo).sowingWidthCm || "-"} cm
                          </p>

                          <p>
                            Hinweise:{" "}
                            {getParsedOcrData(photo).sowingNotes || "-"}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    className="button photo-delete-button"
                    onClick={() => handleStartOcr(photo.id)}
                    disabled={photo.ocrStatus === "processing"}
                  >
                    {photo.ocrStatus === "processing"
                      ? "Texterkennung läuft..."
                      : photo.photoType === "pack_front"
                        ? "Pflanzenname von Vorderseite erkennen"
                        : "Packungsdaten von Rückseite erkennen"}
                  </button>
                  {getParsedOcrData(photo) && (
                    <button
                      type="button"
                      className="button photo-delete-button"
                      onClick={() => {
                        const parsed = getParsedOcrData(photo);

                        const outdoorRange = parsed.outdoorMonths || {};

                        const currentPlantName =
                          newSeedProfile.plantName?.trim();

                        const normalizedParsedPlant = COMMON_PLANT_NAMES.find(
                          (plant) =>
                            plant.toLowerCase() ===
                            parsed.plantName?.toLowerCase(),
                        );

                        if (normalizedParsedPlant) {
                          if (!currentPlantName) {
                            handleSeedProfileChange(
                              "plantName",
                              normalizedParsedPlant,
                            );
                          } else if (
                            currentPlantName.toLowerCase() !==
                            normalizedParsedPlant.toLowerCase()
                          ) {
                            const alreadyContainsNew = currentPlantName
                              .toLowerCase()
                              .includes(normalizedParsedPlant.toLowerCase());

                            if (!alreadyContainsNew) {
                              handleSeedProfileChange(
                                "plantName",
                                `${currentPlantName} / ${normalizedParsedPlant}`,
                              );
                            }
                          }
                        }

                        applyOcrValueIfEmpty(
                          "manufacturer",
                          parsed.manufacturer,
                        );
                        applyOcrValueIfEmpty("retailer", parsed.retailer);
                        applyOcrLifecycleValue(parsed.lifecycle);

                        applyOcrRangeIfEmpty(
                          "germinationDaysMin",
                          "germinationDaysMax",
                          parsed.germinationDays,
                        );

                        applyOcrRangeIfEmpty(
                          "germinationTempMin",
                          "germinationTempMax",
                          parsed.germinationTemp,
                        );

                        const numericDepth = parsed.sowingDepth
                          ? parsed.sowingDepth.replace(",", ".")
                          : "";

                        const numericDepthValue =
                          numericDepth && !Number.isNaN(Number(numericDepth))
                            ? numericDepth
                            : "";

                        const depthNoteValue =
                          numericDepth && !Number.isNaN(Number(numericDepth))
                            ? ""
                            : parsed.sowingDepth || "";

                        applyOcrNumberValueIfEmpty(
                          "sowingDepthCm",
                          numericDepthValue,
                        );
                        applyOcrValueIfEmpty("sowingDepthNote", depthNoteValue);

                        applyOcrValueIfEmpty("sowingNotes", parsed.sowingNotes);
                        applyOcrNumberValueIfEmpty(
                          "sowingWidthCm",
                          parsed.sowingWidthCm,
                        );
                        applyOcrNumberValueIfEmpty(
                          "rowSpacingCm",
                          parsed.rowSpacingCm,
                        );
                        applyOcrNumberValueIfEmpty(
                          "plantSpacingCm",
                          parsed.plantSpacingCm,
                        );

                        applyOcrValueIfEmpty(
                          "sowingFromMonth",
                          parsed.sowingFromMonth,
                        );
                        applyOcrValueIfEmpty(
                          "sowingToMonth",
                          parsed.sowingToMonth,
                        );

                        applyOcrValueIfEmpty(
                          "outdoorFromMonth",
                          getMonthValue(outdoorRange.from),
                        );

                        applyOcrValueIfEmpty(
                          "outdoorToMonth",
                          getMonthValue(outdoorRange.to),
                        );

                        applyOcrValueIfEmpty(
                          "harvestFromMonth",
                          parsed.harvestFromMonth,
                        );
                        applyOcrValueIfEmpty(
                          "harvestToMonth",
                          parsed.harvestToMonth,
                        );
                      }}
                    >
                      {photo.photoType === "pack_front"
                        ? "Vorderseiten-Daten übernehmen"
                        : "OCR-Daten in leere Felder übernehmen"}
                    </button>
                  )}

                  <button
                    type="button"
                    className="button photo-delete-button"
                    onClick={() => handleDeleteSeedPhoto(photo.id)}
                  >
                    Foto löschen
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {selectedPhotoPreview && (
        <div
          className="image-modal-backdrop"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          <div
            className="image-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="image-modal-header">
              <h2>{selectedPhotoPreview.title}</h2>

              <button
                type="button"
                className="button"
                onClick={() => setSelectedPhotoPreview(null)}
              >
                Schließen
              </button>
            </div>

            <img
              src={selectedPhotoPreview.src}
              alt={selectedPhotoPreview.title}
              className="image-modal-photo"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SeedFormPage;
