
import { Type } from "@google/genai";

export const salesSummaryDeclaration = {
  name: "getSalesSummary",

  description:
    "Retrieves the total number of sales orders, total sales revenue, and average order value for the current business. Use this tool when the user asks about overall sales performance or sales summary.",

  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
