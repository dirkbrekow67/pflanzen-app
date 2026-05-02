const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// AKTUELL: Mac
const NETWORK_HOST = "192.168.176.82";


// RASPI:
// const NETWORK_HOST = "192.168.176.89";

export const API_BASE_URL = isLocalhost
  ? "http://localhost:3001"
  : `http://${NETWORK_HOST}:3001`;

export const QR_BASE_URL = isLocalhost
  ? "http://localhost:5173"
  : `http://${NETWORK_HOST}:5173`;