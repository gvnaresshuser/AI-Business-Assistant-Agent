
import { Type } from "@google/genai";

export const topProductsDeclaration = {
  name: "getTopProducts",

  description:
    "Retrieves the top five selling products for the current business, including product name, brand, total quantity sold, and total revenue. Use this function when the user asks about best-selling products, top products, or product sales performance.",

  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
