
import { Type, type FunctionDeclaration } from "@google/genai";

export const purchaseSummaryDeclaration: FunctionDeclaration = {
  name: "getPurchaseSummary",
  description:
    "Get the overall purchase summary for a business, including total purchase orders, total purchase order value, average purchase order value and breakdown by purchase order status.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
