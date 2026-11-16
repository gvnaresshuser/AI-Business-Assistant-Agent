
import { Type, type FunctionDeclaration } from "@google/genai";

export const refundSummaryDeclaration: FunctionDeclaration = {
  name: "getRefundSummary",
  description:
    "Get the overall customer refund summary for a business, including total refund records, total refund amount, average refund amount, refund status breakdown and refund reason breakdown.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
