
import { Type, type FunctionDeclaration } from "@google/genai";

export const expenseSummaryDeclaration: FunctionDeclaration = {
  name: "getExpenseSummary",
  description:
    "Get the overall business expense summary, including total expense records, total expense amount, average expense amount and category-wise expense breakdown.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
