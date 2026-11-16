import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY
});

const EMBEDDING_MODEL = "gemini-embedding-001";

export const generateEmbedding = async (
  text: string
): Promise<number[]> => {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      outputDimensionality: 768
    }
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding || embedding.length !== 768) {
    throw new Error("Failed to generate a valid 768-dimensional embedding");
  }

  return embedding;
};