
import { Type } from "@google/genai";

export const topCustomersDeclaration = {
  name: "getTopCustomers",

  description:
    "Retrieves the top five customers for the current business based on total sales order value. Returns customer name, email, total orders, total revenue, and average order value. Use this function when the user asks about top customers, highest-value customers, or customer sales performance.",

  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};
