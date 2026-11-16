import type { Request, Response } from "express";
import { z } from "zod";

import { ingestDocument } from "../services/knowledge-ingestion.service.js";
import { generateKnowledgeAnswer } from "../services/knowledge-answer.service.js";
import { getBusinessKnowledgeDocuments,deleteBusinessKnowledgeDocument } from "../services/knowledge-search.service.js";
import { extractDocumentText } from "../services/document-extraction.service.js";
import path from "node:path";
const documentSchema = z.object({
  documentName: z.string().trim().min(1).max(255),
  content: z.string().trim().min(1).max(100000)
});

const searchSchema = z.object({
  question: z.string().trim().min(1).max(2000)
});

export const uploadKnowledgeDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const validation = documentSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid document details",
        errors: validation.error.issues
      });
      return;
    }

    const result = await ingestDocument({
      businessId: req.user.businessId,
      documentName: validation.data.documentName,
      content: validation.data.content
    });

    res.status(201).json({
      success: true,
      message: "Knowledge document processed successfully",
      totalChunks: result.totalChunks
    });
} catch (error) {
  console.error("Knowledge Document Upload Error:", error);

  if (
    error instanceof Error &&
    error.message === "A document with this name already exists."
  ) {
    res.status(409).json({
      success: false,
      message: error.message
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Unable to process knowledge document"
  });
}
};

export const searchBusinessKnowledge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const validation = searchSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid search question",
        errors: validation.error.issues
      });
      return;
    }

    const result = await generateKnowledgeAnswer(
      req.user.businessId,
      validation.data.question
    );

    res.status(200).json({
      success: true,
      message: "Knowledge search completed successfully",
      data: result
    });
  } catch (error) {
  console.error("Business Knowledge Search Error:", error);

  // Handle Gemini API quota exhaustion
  const apiStatus = (error as { status?: number })?.status;

  if (apiStatus === 429) {
    res.status(429).json({
      success: false,
      message:
        "The AI service has temporarily reached its daily usage limit. Please try again later."
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Unable to search business knowledge"
  });
}
};
export const getKnowledgeDocumentsList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const documents = await getBusinessKnowledgeDocuments(
      req.user.businessId
    );

    res.status(200).json({
      success: true,
      message: "Knowledge documents retrieved successfully",
      data: documents
    });
  } catch (error) {
    console.error("Knowledge Documents List Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve knowledge documents"
    });
  }
};


export const deleteKnowledgeDocumentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const documentNameParam = req.params.documentName;

const documentName =
  typeof documentNameParam === "string"
    ? documentNameParam
    : documentNameParam?.[0];

if (!documentName || !documentName.trim()) {
      res.status(400).json({
        success: false,
        message: "Document name is required"
      });
      return;
    }

    const deletedChunks = await deleteBusinessKnowledgeDocument(
      req.user.businessId,
      documentName
    );

    if (deletedChunks === 0) {
      res.status(404).json({
        success: false,
        message: "Knowledge document not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Knowledge document deleted successfully",
      deletedChunks
    });
  } catch (error) {
    console.error("Knowledge Document Delete Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete knowledge document"
    });
  }
};



export const uploadKnowledgeFilesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: "Please select at least one file"
      });
      return;
    }

    const results: {
      fileName: string;
      success: boolean;
      message: string;
      totalChunks?: number;
    }[] = [];

    for (const file of files) {
      const documentName = path.basename(file.originalname);

      try {
        // Step 1: Extract text from the uploaded file
        const content = await extractDocumentText(
          documentName,
          file.buffer
        );

        // Step 2: Validate extracted content length
        if (content.length > 100000) {
          throw new Error(
            "Extracted document content exceeds the 100000 character limit."
          );
        }

        // Step 3: Send extracted text to existing RAG ingestion service
        const result = await ingestDocument({
          businessId: req.user.businessId,
          documentName,
          content
        });

        results.push({
          fileName: documentName,
          success: true,
          message: "Document processed successfully",
          totalChunks: result.totalChunks
        });

      } catch (error) {
        console.error(
          `Knowledge File Processing Error (${documentName}):`,
          error
        );

        results.push({
          fileName: documentName,
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Unable to process document"
        });
      }
    }

    const successfulFiles = results.filter(
      (file) => file.success
    ).length;

    const failedFiles = results.length - successfulFiles;

    res.status(successfulFiles > 0 ? 201 : 400).json({
      success: successfulFiles > 0,
      message: `${successfulFiles} file(s) processed successfully, ${failedFiles} file(s) failed`,
      totalFiles: files.length,
      successfulFiles,
      failedFiles,
      results
    });

  } catch (error) {
    console.error("Multiple Knowledge File Upload Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process uploaded knowledge files"
    });
  }
};
