
import api from "./axios";

export interface KnowledgeFilesUploadResponse {
  success: boolean;
  message: string;
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
  results: {
    fileName: string;
    success: boolean;
    message: string;
    totalChunks?: number;
  }[];
}

// Individual knowledge document details
export interface KnowledgeDocument {
  document_name: string;
  total_chunks: number;
  uploaded_at: string;
}

// Response returned by document listing API
export interface KnowledgeDocumentsResponse {
  success: boolean;
  message: string;
  data: KnowledgeDocument[];
}
// Response after uploading a knowledge document
export interface KnowledgeUploadResponse {
  success: boolean;
  message: string;
  totalChunks: number;
}

// Source information returned by RAG search
export interface KnowledgeSource {
  documentName: string;
  chunkIndex: number;
  similarity: number;
}

// Response returned by knowledge search
export interface KnowledgeSearchResponse {
  success: boolean;
  message: string;
  data: {
    answer: string;
    sources: KnowledgeSource[];
  };
}

// Upload a text document to the knowledge base
export const uploadKnowledgeDocumentApi = async (
  documentName: string,
  content: string
): Promise<KnowledgeUploadResponse> => {
  const response = await api.post<KnowledgeUploadResponse>(
    "/knowledge/documents",
    {
      documentName,
      content,
    }
  );

  return response.data;
};

// Search business knowledge using RAG
export const searchBusinessKnowledgeApi = async (
  question: string
): Promise<KnowledgeSearchResponse> => {
  const response = await api.post<KnowledgeSearchResponse>(
    "/knowledge/search",
    {
      question,
    }
  );

  return response.data;
};

// Get all uploaded business knowledge documents
export const getKnowledgeDocumentsApi = async (): Promise<KnowledgeDocumentsResponse> => {
  const response = await api.get<KnowledgeDocumentsResponse>(
    "/knowledge/documents"
  );

  return response.data;
};

// Delete a knowledge document
export const deleteKnowledgeDocumentApi = async (
  documentName: string
): Promise<{ success: boolean; message: string; deletedChunks: number }> => {
  const response = await api.delete(
    `/knowledge/documents/${encodeURIComponent(documentName)}`
  );

  return response.data;
};

export const uploadKnowledgeFilesApi = async (
  files: File[]
): Promise<KnowledgeFilesUploadResponse> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post<KnowledgeFilesUploadResponse>(
    "/knowledge/documents/files",
    formData
  );

  return response.data;
};