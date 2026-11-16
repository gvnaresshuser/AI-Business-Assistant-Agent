
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import databaseRoutes from "./routes/database.routes.js";
import businessRoutes from "./routes/business.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import salesOrderRoutes from "./routes/sales-order.routes.js";
import salesOrderItemRoutes from "./routes/sales-order-item.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import purchaseOrderRoutes from "./routes/purchase-order.routes.js";
import purchaseOrderItemRoutes from "./routes/purchase-order-item.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import stockMovementRoutes from "./routes/stock-movement.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import salesPaymentRoutes from "./routes/sales-payment.routes.js";
import salesRefundRoutes from "./routes/sales-refund.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import monthlySalesRoutes from "./routes/monthly-sales.routes.js";
import topProductsRoutes from "./routes/top-products.routes.js";
import topCustomersRoutes from "./routes/top-customers.routes.js";
import lowStockRoutes from "./routes/low-stock.routes.js";
import outOfStockRoutes from "./routes/out-of-stock.routes.js";
import categorySalesRoutes from "./routes/category-sales.routes.js";
import paymentMethodRoutes from "./routes/payment-method.routes.js";
import dailySalesRoutes from "./routes/daily-sales.routes.js";
import inventoryValuationRoutes from "./routes/inventory-valuation.routes.js";
import stockMovementSummaryRoutes from "./routes/stock-movement-summary.routes.js";
import purchaseSummaryRoutes from "./routes/purchase-summary.routes.js";
import vendorPurchaseRoutes from "./routes/vendor-purchase.routes.js";
import expenseSummaryRoutes from "./routes/expense-summary.routes.js";
import refundSummaryRoutes from "./routes/refund-summary.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { authenticateToken } from "./middleware/auth.middleware.js";
import { authorizeRoles } from "./middleware/authorizeRole.middleware.js";
import knowledgeRoutes from "./routes/knowledge.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Public health endpoints
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Business Assistant API is running!"
  });
});

app.use("/api/database", databaseRoutes);

// Public authentication endpoints
app.use("/api/auth", authRoutes);

// Protect all remaining API endpoints
app.use("/api", authenticateToken);

// Business profile – Admin only
app.use(
  "/api/businesses",
  authorizeRoles("Admin"),
  businessRoutes
);

// Products – All roles
app.use(
  "/api/products",
  authorizeRoles("Admin", "Manager", "Staff"),
  productRoutes
);

// Categories – All roles
app.use(
  "/api/categories",
  authorizeRoles("Admin", "Manager", "Staff"),
  categoryRoutes
);

// Customers – All roles
app.use(
  "/api/customers",
  authorizeRoles("Admin", "Manager", "Staff"),
  customerRoutes
);

// Sales operations – All roles
app.use(
  "/api/sales-orders",
  authorizeRoles("Admin", "Manager", "Staff"),
  salesOrderRoutes
);

app.use(
  "/api/sales-order-items",
  authorizeRoles("Admin", "Manager", "Staff"),
  salesOrderItemRoutes
);

app.use(
  "/api/sales-payments",
  authorizeRoles("Admin", "Manager", "Staff"),
  salesPaymentRoutes
);

// Sales refunds – Admin and Manager
app.use(
  "/api/sales-refunds",
  authorizeRoles("Admin", "Manager"),
  salesRefundRoutes
);

// Vendors and purchasing – Admin and Manager
app.use(
  "/api/vendors",
  authorizeRoles("Admin", "Manager"),
  vendorRoutes
);

app.use(
  "/api/purchase-orders",
  authorizeRoles("Admin", "Manager"),
  purchaseOrderRoutes
);

app.use(
  "/api/purchase-order-items",
  authorizeRoles("Admin", "Manager"),
  purchaseOrderItemRoutes
);

// Inventory operations – All roles
app.use(
  "/api/inventory",
  authorizeRoles("Admin", "Manager", "Staff"),
  inventoryRoutes
);

app.use(
  "/api/stock-movements",
  authorizeRoles("Admin", "Manager", "Staff"),
  stockMovementRoutes
);

// Expenses – Admin and Manager
app.use(
  "/api/expenses",
  authorizeRoles("Admin", "Manager"),
  expenseRoutes
);

// Analytics – Admin and Manager
app.use(
  "/api/analytics",
  authorizeRoles("Admin", "Manager"),
  analyticsRoutes
);

app.use(
  "/api/analytics/monthly-sales",
  authorizeRoles("Admin", "Manager"),
  monthlySalesRoutes
);

app.use(
  "/api/analytics/top-products",
  authorizeRoles("Admin", "Manager"),
  topProductsRoutes
);

app.use(
  "/api/analytics/top-customers",
  authorizeRoles("Admin", "Manager"),
  topCustomersRoutes
);

app.use(
  "/api/analytics/low-stock",
  authorizeRoles("Admin", "Manager"),
  lowStockRoutes
);

app.use(
  "/api/analytics/out-of-stock",
  authorizeRoles("Admin", "Manager"),
  outOfStockRoutes
);

app.use(
  "/api/analytics/category-sales",
  authorizeRoles("Admin", "Manager"),
  categorySalesRoutes
);

app.use(
  "/api/analytics/payment-methods",
  authorizeRoles("Admin", "Manager"),
  paymentMethodRoutes
);

app.use(
  "/api/analytics/daily-sales",
  authorizeRoles("Admin", "Manager"),
  dailySalesRoutes
);

app.use(
  "/api/analytics/inventory-valuation",
  authorizeRoles("Admin", "Manager"),
  inventoryValuationRoutes
);

app.use(
  "/api/analytics/stock-movement-summary",
  authorizeRoles("Admin", "Manager"),
  stockMovementSummaryRoutes
);

app.use(
  "/api/analytics/purchase-summary",
  authorizeRoles("Admin", "Manager"),
  purchaseSummaryRoutes
);

app.use(
  "/api/analytics/vendor-purchases",
  authorizeRoles("Admin", "Manager"),
  vendorPurchaseRoutes
);

app.use(
  "/api/analytics/expense-summary",
  authorizeRoles("Admin", "Manager"),
  expenseSummaryRoutes
);

app.use(
  "/api/analytics/refund-summary",
  authorizeRoles("Admin", "Manager"),
  refundSummaryRoutes
);

// AI Business Agent – Admin and Manager
app.use(
  "/api/agent",
  authorizeRoles("Admin", "Manager"),
  agentRoutes
);

// RAG Knowledge Management – Admin and Manager
app.use(
  "/api/knowledge",
  authorizeRoles("Admin", "Manager"),
  knowledgeRoutes
);



export default app;
