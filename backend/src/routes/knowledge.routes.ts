
import { Router } from "express";

import {
  uploadKnowledgeDocument,
  uploadKnowledgeFilesController,
  searchBusinessKnowledge,
  getKnowledgeDocumentsList,
  deleteKnowledgeDocumentController
} from "../controllers/knowledge.controller.js";

import { uploadKnowledgeFiles } from "../middleware/knowledge-upload.middleware.js";

const router = Router();

// Upload knowledge document
router.post("/documents", uploadKnowledgeDocument);

// New multiple-file upload
router.post(
  "/documents/files",
  uploadKnowledgeFiles,
  uploadKnowledgeFilesController
);

// List uploaded knowledge documents
router.get("/documents", getKnowledgeDocumentsList);

// Search business knowledge
router.post("/search", searchBusinessKnowledge);

// Delete knowledge document
router.delete(
  "/documents/:documentName",
  deleteKnowledgeDocumentController
);

export default router;
