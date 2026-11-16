
import { GoogleGenAI } from "@google/genai";
import { env } from "./env.js";

// Initialize Gemini AI client
export const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY
});

/* const model =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";
  console.log('model::'+model); */

// Gemini model configuration
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
