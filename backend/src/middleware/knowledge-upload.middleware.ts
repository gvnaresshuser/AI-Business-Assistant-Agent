
import multer from "multer";
import { extname } from "node:path";

const allowedExtensions = [".pdf", ".docx", ".doc", ".txt"];

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 10,                  // Maximum 10 files
  },

  fileFilter: (_req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return callback(
        new Error(
          "Unsupported file format. Only PDF, DOCX, DOC and TXT files are allowed."
        )
      );
    }

    callback(null, true);
  },
});

export const uploadKnowledgeFiles = upload.array("files", 10);
