
import { Type, type FunctionDeclaration } from "@google/genai";

export const paymentMethodDeclaration: FunctionDeclaration = {
  name: "getPaymentMethodSummary",
  description:
    "Get completed payment statistics grouped by payment method, including payment count and total amount collected.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
