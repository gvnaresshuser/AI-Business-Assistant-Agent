
import { z } from "zod";

import { getSalesSummary } from "./sales-summary.tool.js";
import { getTopProducts } from "./top-products.tool.js";
import { getTopCustomers } from "./top-customers.tool.js";
import { getLowStockProducts } from "./low-stock.tool.js";
import { getOutOfStockProducts } from "./out-of-stock.tool.js";
import { getMonthlySales } from "./monthly-sales.tool.js";
import { getCategorySales } from "./category-sales.tool.js";
import { getPaymentMethodSummary } from "./payment-method.tool.js";
import { getDailySales } from "./daily-sales.tool.js";
import { getInventoryValuation } from "./inventory-valuation.tool.js";
import { getStockMovementSummary } from "./stock-movement-summary.tool.js";
import { getPurchaseSummary } from "./purchase-summary.tool.js";
import { getVendorPurchases } from "./vendor-purchase.tool.js";
import { getExpenseSummary } from "./expense-summary.tool.js";
import { getRefundSummary } from "./refund-summary.tool.js";

const businessIdSchema = z.string().uuid();

export const executeAgentTool = async (
  functionName: string,
  businessId: string
): Promise<unknown> => {

  const validatedBusinessId = businessIdSchema.parse(businessId);

  switch (functionName) {

    case "getSalesSummary":
      return getSalesSummary({ businessId: validatedBusinessId });

    case "getTopProducts":
      return getTopProducts({ businessId: validatedBusinessId });

    case "getTopCustomers":
      return getTopCustomers({ businessId: validatedBusinessId });

    case "getLowStockProducts":
      return getLowStockProducts({ businessId: validatedBusinessId });

    case "getOutOfStockProducts":
      return getOutOfStockProducts({ businessId: validatedBusinessId });

    case "getMonthlySales":
      return getMonthlySales({ businessId: validatedBusinessId });

    case "getCategorySales":
      return getCategorySales({ businessId: validatedBusinessId });

    case "getPaymentMethodSummary":
      return getPaymentMethodSummary({ businessId: validatedBusinessId });

    case "getDailySales":
      return getDailySales({ businessId: validatedBusinessId });

    case "getInventoryValuation":
      return getInventoryValuation({ businessId: validatedBusinessId });

    case "getStockMovementSummary":
      return getStockMovementSummary({ businessId: validatedBusinessId });

    case "getPurchaseSummary":
      return getPurchaseSummary({ businessId: validatedBusinessId });

    case "getVendorPurchases":
      return getVendorPurchases({ businessId: validatedBusinessId });

    case "getExpenseSummary":
      return getExpenseSummary({ businessId: validatedBusinessId });

    case "getRefundSummary":
      return getRefundSummary({ businessId: validatedBusinessId });

    default:
      throw new Error(
        `Unknown or unsupported agent tool: ${functionName}`
      );
  }
};
