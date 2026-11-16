
import { Type } from "@google/genai";

export const outOfStockDeclaration = {
  name: "getOutOfStockProducts",

  description:
    "Retrieves all active products with zero or negative available stock. Returns product name, brand, SKU, quantity on hand, reserved quantity, available quantity, and reorder level. Use this function when the user asks which products are out of stock or unavailable.",

  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
