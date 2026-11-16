
import { Type } from "@google/genai";

export const monthlySalesDeclaration = {
  name: "getMonthlySales",

  description:
    "Retrieves monthly sales performance for the current business. Returns the month, total number of orders, total sales revenue, and average order value. Use this function when the user asks about monthly sales, sales trends, or month-wise business performance.",

  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
