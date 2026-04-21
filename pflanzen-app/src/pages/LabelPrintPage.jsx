import { Link } from "react-router-dom";
import { QRCode } from "react-qr-code";
import { QR_BASE_URL } from "../utils/appConfig";

function LabelPrintPage({ pots, selectedLabelIds }) {
  // Nimmt nur die Töpfe, deren IDs für den Druck ausgewählt wurden
  const selectedPots = pots.filter((pot) => selectedLabelIds.includes(pot.id));

  return (
    <div className="label-page">
      <div className="label-actions no-print">
        <Link to="/" className="button-link">
          ← Zur Übersicht
        </Link>
        <button onClick={() => window.print()} className="button">
          Drucken
        </button>
      </div>
      {selectedPots.length === 0 ? (
        <div className="card-light">
          {" "}
          <h2>Keine Etiketten ausgewählt</h2>{" "}
          <p>Bitte wähle vorher einen Topf aus.</p>{" "}
        </div>
      ) : (
        <div className="label-sheet">
          {selectedPots.map((pot) => {
            const qrValue = `${QR_BASE_URL}/pot/${pot.id}`;

            return (
              <div key={pot.id} className="compact-label">
                <div className="compact-label-id">{pot.id}</div>

                <div className="compact-label-qr">
                  <QRCode value={qrValue} size={110} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LabelPrintPage;
