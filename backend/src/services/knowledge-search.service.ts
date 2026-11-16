import { generateEmbedding } from "./embedding.service.js";
import {
  searchKnowledgeChunks,
  getKnowledgeDocuments,
  deleteKnowledgeDocument,
} from "../repositories/knowledge.repository.js";

export const searchKnowledge = async (
  businessId: string,
  question: string
) => {
  const cleanQuestion = question.trim();

  if (!cleanQuestion) {
    throw new Error("Search question cannot be empty");
  }

  const queryEmbedding = await generateEmbedding(cleanQuestion);

  const results = await searchKnowledgeChunks(
    businessId,
    queryEmbedding,
    5
  );

  return results;
};
export const getBusinessKnowledgeDocuments = async (
  businessId: string
) => {
  return await getKnowledgeDocuments(businessId);
};
export const deleteBusinessKnowledgeDocument = async (
  businessId: string,
  documentName: string
): Promise<number> => {
  return await deleteKnowledgeDocument(businessId, documentName);
};