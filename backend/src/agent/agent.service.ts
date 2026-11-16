
import type { Content } from "@google/genai";

import { gemini, GEMINI_MODEL } from "../config/gemini.js";
import { AGENT_SYSTEM_PROMPT } from "./prompts/agent.prompt.js";
import { agentTools } from "./tools/agent-tools.js";
import { executeAgentTool } from "./tools/tool-executor.js";

import type { AgentMessage } from "../repositories/message.repository.js";

export const generateAgentResponse = async (
  question: string,
  businessId: string,
  conversationHistory: AgentMessage[] = []
): Promise<string> => {

  // Convert database messages into Gemini conversation content
  const contents: Content[] = conversationHistory
    .filter(
      (message) =>
        message.sender_type === "User" ||
        message.sender_type === "Assistant"
    )
    .map((message) => ({
      role: message.sender_type === "User" ? "user" : "model",
      parts: [{ text: message.message_content }]
    }));

  // Add the latest user question
  contents.push({
    role: "user",
    parts: [{ text: question }]
  });

  // Allow a maximum of 5 tool-calling rounds
  for (let round = 0; round < 5; round++) {

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: AGENT_SYSTEM_PROMPT,
        tools: agentTools
      }
    });

    const functionCalls = response.functionCalls;

    // No function call: return Gemini's final answer
    if (!functionCalls || functionCalls.length === 0) {

      const answer = response.text;

      if (!answer) {
        throw new Error("Gemini returned an empty response");
      }

      return answer;
    }

    // Preserve Gemini's function-call response
    const modelContent = response.candidates?.[0]?.content;

    if (!modelContent) {
      throw new Error("Gemini returned an invalid function call");
    }

    contents.push(modelContent);

    // Execute each approved function
    for (const functionCall of functionCalls) {

      if (!functionCall.name) {
        throw new Error("Function name is missing");
      }

      const toolResult = await executeAgentTool(
        functionCall.name,
        businessId
      );

      // Send the function result back to Gemini
      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name: functionCall.name,
              response: {
                result: toolResult
              },
              ...(functionCall.id
                ? { id: functionCall.id }
                : {})
            }
          }
        ]
      });
    }
  }

  throw new Error("Maximum agent tool-calling rounds exceeded");
};
