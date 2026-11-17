
import { gemini, GEMINI_MODEL } from "../config/gemini.js";
import { searchKnowledge } from "./knowledge-search.service.js";

export const generateKnowledgeAnswer = async (
  businessId: string,
  question: string
) => {
  const results = await searchKnowledge(businessId, question);

  if (results.length === 0) {
    return {
      answer:
        "I could not find relevant information in the business knowledge documents.",
      sources: []
    };
  }

  const context = results
    .map(
      (item, index) =>
        `Source ${index + 1}: ${item.document_name}\n${item.chunk_content}`
    )
    .join("\n\n");

  const response = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: `
You are an AI Business Assistant.

Answer the user's question using only the supplied business knowledge.

Rules:
1. Identify the source chunks directly relevant to the question.
2. Do not use unrelated documents to answer.
3. If a specific document is mentioned, prioritise that document.
4. If the requested document does not contain the answer, clearly say so.
5. If multiple sources contain conflicting information, explain each conflict and identify the document names. Do not select one as correct.
6. Do not invent information.
7. Include only source numbers that genuinely support your answer in relevantSourceNumbers.
8. Use the original source numbers shown in the supplied context.

Business Knowledge:
${context}

User Question:
${question}
`,
    config: {
      maxOutputTokens: 2048,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          answer: {
            type: "STRING"
          },
          relevantSourceNumbers: {
            type: "ARRAY",
            items: {
              type: "INTEGER"
            }
          }
        },
        required: ["answer", "relevantSourceNumbers"]
      }
    }
  });

  const rawResponse = response.text ?? "";
  console.log("========== GEMINI RAG DEBUG ==========");
console.log("Raw Gemini Response:", rawResponse);
console.log(
  "Gemini Candidates:",
  JSON.stringify(response.candidates, null, 2)
);
console.log("======================================");

  let parsedResponse: {
    answer: string;
    relevantSourceNumbers: number[];
  };

  try {
  parsedResponse = JSON.parse(rawResponse);

  if (
    typeof parsedResponse.answer !== "string" ||
    !Array.isArray(parsedResponse.relevantSourceNumbers)
  ) {
    throw new Error("Unexpected JSON response structure.");
  }

} catch (error) {
  console.error("Gemini JSON Parsing Error:", error);
  console.error("Raw Response Received:", rawResponse);

  throw new Error("Gemini returned an invalid structured response.");
}

  const relevantSourceNumbers = new Set(
    parsedResponse.relevantSourceNumbers.filter(
      (number) =>
        Number.isInteger(number) &&
        number >= 1 &&
        number <= results.length
    )
  );

  const sources = results
    .filter((_, index) => relevantSourceNumbers.has(index + 1))
    .map((item) => ({
      documentName: item.document_name,
      chunkIndex: item.chunk_index,
      similarity: item.similarity
    }));

  return {
    answer: parsedResponse.answer,
    sources
  };
};
