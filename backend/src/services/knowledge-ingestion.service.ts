
import { generateEmbedding } from "./embedding.service.js";
import {
  knowledgeDocumentExists,
  type KnowledgeChunkInput,
} from "../repositories/knowledge.repository.js";
import { chunkText } from "../utils/textChunker.js";
import { dbTransaction } from "../utils/dbQuery.js";

export interface KnowledgeChunkInputWithEmbedding extends KnowledgeChunkInput {}

interface IngestDocumentInput {
  businessId: string;
  documentName: string;
  content: string;
}

export const ingestDocument = async (
  input: IngestDocumentInput
): Promise<{ totalChunks: number }> => {
  const chunks = chunkText(input.content);

  if (chunks.length === 0) {
    throw new Error("Document content is empty");
  }
  const documentExists = await knowledgeDocumentExists(
  input.businessId,
  input.documentName
);

if (documentExists) {
  throw new Error(
    "A document with this name already exists."
  );
}

  const knowledgeChunks: KnowledgeChunkInput[] = [];

  // Step 1: Generate embeddings before starting the transaction
  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index];

    const embedding = await generateEmbedding(chunk);

    knowledgeChunks.push({
      businessId: input.businessId,
      documentName: input.documentName,
      chunkIndex: index,
      chunkContent: chunk,
      embedding,
      metadata: {
        source: input.documentName
      }
    });
  }

  // Step 2: Save all chunks in one transaction
  await dbTransaction(async (client) => {
    for (const chunk of knowledgeChunks) {
      const embeddingString = `[${chunk.embedding.join(",")}]`;

      await client.query(
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
          chunk.businessId,
          chunk.documentName,
          chunk.chunkIndex,
          chunk.chunkContent,
          embeddingString,
          JSON.stringify(chunk.metadata ?? {})
        ]
      );
    }
  });

  return {
    totalChunks: knowledgeChunks.length
  };
};


