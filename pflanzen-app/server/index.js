import express from "express";
import cors from "cors";
import db from "./database/db.js";


const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server läuft",
  });
});

app.get("/api/pots", (req, res) => {
  try {
    const pots = db.prepare("SELECT * FROM pots ORDER BY id").all();
    res.json(pots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fehler beim Laden der Töpfe" });
  }
});
app.post("/api/pots", (req, res) => {
  try {
    const {
      id,
      plantName,
      status,
      sowingDate
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO pots (
        id,
        plantName,
        status,
        sowingDate
      )
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(
      id,
      plantName,
      status,
      sowingDate
    );

    res.json({
      success: true,
      message: "Topf gespeichert",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Speichern fehlgeschlagen",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});