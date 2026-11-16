import { salesSummaryDeclaration } from "./sales-summary.declaration.js";
import { topProductsDeclaration } from "./top-products.declaration.js";
import { topCustomersDeclaration } from "./top-customers.declaration.js";
import { lowStockDeclaration } from "./low-stock.declaration.js";
import { outOfStockDeclaration } from "./out-of-stock.declaration.js";
import { monthlySalesDeclaration } from "./monthly-sales.declaration.js";
import { categorySalesDeclaration } from "./category-sales.declaration.js";
import { paymentMethodDeclaration } from "./payment-method.declaration.js";
import { dailySalesDeclaration } from "./daily-sales.declaration.js";
import { inventoryValuationDeclaration } from "./inventory-valuation.declaration.js";
import { stockMovementSummaryDeclaration } from "./stock-movement-summary.declaration.js";
import { purchaseSummaryDeclaration } from "./purchase-summary.declaration.js";
import { vendorPurchaseDeclaration } from "./vendor-purchase.declaration.js";
import { expenseSummaryDeclaration } from "./expense-summary.declaration.js";
import { refundSummaryDeclaration } from "./refund-summary.declaration.js";

// Central registry of tools available to Gemini
export const agentTools = [
  {
    functionDeclarations: [
      salesSummaryDeclaration,
      topProductsDeclaration,
      topCustomersDeclaration,
      lowStockDeclaration,
      outOfStockDeclaration,
      monthlySalesDeclaration,
      categorySalesDeclaration,
      paymentMethodDeclaration,
      dailySalesDeclaration,
      inventoryValuationDeclaration,
      stockMovementSummaryDeclaration,
      purchaseSummaryDeclaration,
      vendorPurchaseDeclaration,
      expenseSummaryDeclaration,
      refundSummaryDeclaration
    ]
  }
];
