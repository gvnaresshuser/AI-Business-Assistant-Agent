
import { Type, type FunctionDeclaration } from "@google/genai";

export const vendorPurchaseDeclaration: FunctionDeclaration = {
  name: "getVendorPurchases",
  description:
    "Get a vendor-wise purchase report, including vendor names, number of purchase orders, total purchase value and average purchase order value. Include vendors with zero purchase orders.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
