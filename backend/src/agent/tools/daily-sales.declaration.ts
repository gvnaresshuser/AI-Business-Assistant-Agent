
import { Type, type FunctionDeclaration } from "@google/genai";

export const dailySalesDeclaration: FunctionDeclaration = {
  name: "getDailySales",
  description:
    "Get daily sales performance, including sales date, number of orders, total sales and average order value for each day.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
