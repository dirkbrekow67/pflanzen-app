import express from "express";
import cors from "cors";
import fs from "fs";
import seedProfilePhotosRoutes from "./routes/seedProfilePhotosRoutes.js";
import potPhotosRoutes from "./routes/potPhotosRoutes.js";
import potsRoutes from "./routes/potsRoutes.js";
import potHistoryRoutes from "./routes/potHistoryRoutes.js";
import seedProfilesRoutes from "./routes/seedProfilesRoutes.js";
import statisticsRoutes from "./routes/statisticsRoutes.js";
import remindersRoutes from "./routes/remindersRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import scannerRoutes from "./routes/scannerRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const uploadDir = "server/uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Uploads-Ordner wurde erstellt:", uploadDir);
}

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("server/uploads"));

app.use("/api/seed-profile-photos", seedProfilePhotosRoutes);
app.use("/api/photos", potPhotosRoutes);
app.use("/api/pots", potsRoutes);
app.use("/api/pot-history", potHistoryRoutes);
app.use("/api/seed-profiles", seedProfilesRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/reminders", remindersRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/scanner", scannerRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
