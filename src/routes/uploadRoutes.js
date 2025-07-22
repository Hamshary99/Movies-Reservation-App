import express from "express";
import upload from "../middleware/uploadHandler.js";
import { auth } from "../middleware/auth.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Handle single file upload
router.post("/upload", auth, upload.single("poster"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Return the file path
    res.json({
      filePath: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve uploaded files
router.use(
  "/uploads",
  express.static(path.join(__dirname, "../../public/uploads"))
);

export default router;
