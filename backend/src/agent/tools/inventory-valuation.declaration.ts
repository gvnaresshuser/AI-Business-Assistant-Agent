
import { Type, type FunctionDeclaration } from "@google/genai";

export const inventoryValuationDeclaration: FunctionDeclaration = {
  name: "getInventoryValuation",
  description:
    "Get inventory valuation for a business, including total products, total units, total inventory cost value, potential selling value and product-wise valuation details.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
