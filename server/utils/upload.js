import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let targetFolder = "server/uploads/";

    if (req.originalUrl.includes("seed-profile-photos")) {
      targetFolder = "server/uploads/seed-profiles/";
    }

    if (req.originalUrl.includes("/api/photos")) {
      targetFolder = "server/uploads/pots/";
    }

    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    cb(null, targetFolder);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

const upload = multer({ storage });

export default upload;
