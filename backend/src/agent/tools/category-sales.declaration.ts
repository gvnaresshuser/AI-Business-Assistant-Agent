
import { Type, type FunctionDeclaration } from "@google/genai";

export const categorySalesDeclaration: FunctionDeclaration = {
  name: "getCategorySales",
  description:
    "Get sales performance by product category, including number of products, total units sold and total sales revenue.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
