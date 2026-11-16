import { dbQuery } from "../utils/dbQuery.js";

export interface KnowledgeChunkInput {
  businessId: string;
  documentName: string;
  chunkIndex: number;
  chunkContent: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}

export const saveKnowledgeChunk = async (
  input: KnowledgeChunkInput
): Promise<void> => {
  const embeddingString = `[${input.embedding.join(",")}]`;

  await dbQuery(
    `INSERT INTO agent_knowledge_chunks_biz_agent (
      business_id,
      document_name,
      chunk_index,
      chunk_content,
      embedding,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5::vector, $6::jsonb)`,
    [
      input.businessId,
      input.documentName,
      input.chunkIndex,
      input.chunkContent,
      embeddingString,
      JSON.stringify(input.metadata ?? {})
    ]
  );
};

export interface KnowledgeSearchResult {
  id: string;
  document_name: string;
  chunk_content: string;
  chunk_index: number;
  similarity: number;
}

export const searchKnowledgeChunks = async (
  businessId: string,
  embedding: number[],
  limit = 5
): Promise<KnowledgeSearchResult[]> => {
  const embeddingString = `[${embedding.join(",")}]`;

  const result = await dbQuery<KnowledgeSearchResult>(
        `SELECT
        id,
        document_name,
        chunk_content,
        chunk_index,
        1 - (embedding <=> $1::vector) AS similarity
     FROM agent_knowledge_chunks_biz_agent
     WHERE business_id = $2
ORDER BY embedding <=> $1::vector
LIMIT $3`,
    [embeddingString, businessId, limit]
  );

  return result.rows;
};

export interface KnowledgeDocument {
  document_name: string;
  total_chunks: number;
  uploaded_at: Date;
}

export const getKnowledgeDocuments = async (
  businessId: string
): Promise<KnowledgeDocument[]> => {
  const result = await dbQuery<KnowledgeDocument>(
    `SELECT
        document_name,
        COUNT(*)::int AS total_chunks,
        MIN(created_at) AS uploaded_at
     FROM agent_knowledge_chunks_biz_agent
     WHERE business_id = $1
     GROUP BY document_name
     ORDER BY uploaded_at DESC`,
    [businessId]
  );

  return result.rows;
};

export const knowledgeDocumentExists = async (
  businessId: string,
  documentName: string
): Promise<boolean> => {
  const result = await dbQuery<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM agent_knowledge_chunks_biz_agent
       WHERE business_id = $1
         AND LOWER(TRIM(document_name)) = LOWER(TRIM($2))
     ) AS exists`,
    [businessId, documentName]
  );

  return result.rows[0].exists;
};

export const deleteKnowledgeDocument = async (
  businessId: string,
  documentName: string
): Promise<number> => {
  const result = await dbQuery(
    `DELETE FROM agent_knowledge_chunks_biz_agent
     WHERE business_id = $1
       AND document_name = $2`,
    [businessId, documentName]
  );

  return result.rowCount ?? 0;
};
