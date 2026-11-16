
import { Type } from "@google/genai";

export const lowStockDeclaration = {
  name: "getLowStockProducts",

  description:
    "Retrieves all active products whose available stock is at or below their reorder level. Returns product name, brand, SKU, quantity on hand, reserved quantity, available quantity, and reorder level. Use this function when the user asks about low stock, products needing replenishment, or inventory shortages.",

  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
