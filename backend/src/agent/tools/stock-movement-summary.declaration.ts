
import { Type, type FunctionDeclaration } from "@google/genai";

export const stockMovementSummaryDeclaration: FunctionDeclaration = {
  name: "getStockMovementSummary",
  description:
    "Get a summary of stock movements for a business, including movement types, number of movement records and total quantities for sales, purchases, returns, damage and adjustments.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
