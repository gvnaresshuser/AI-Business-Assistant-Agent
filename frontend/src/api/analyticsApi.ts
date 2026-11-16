
import api from "./axios";

// =====================================================
// 1. SALES SUMMARY
// =====================================================

export interface SalesSummary {
  total_orders: number;
  total_sales: string;
  average_order_value: string;
}

interface SalesSummaryResponse {
  success: boolean;
  data: SalesSummary;
}

export const getSalesSummaryApi = async (
  startDate?: string,
  endDate?: string
): Promise<SalesSummary> => {
  const response = await api.get<SalesSummaryResponse>(
    "/analytics/sales-summary",
    {
      params: { startDate, endDate },
    }
  );

  return response.data.data;
};

// =====================================================
// 2. MONTHLY SALES
// =====================================================

export interface MonthlySales {
  month: string;
  total_orders: number;
  total_sales: string;
  average_order_value: string;
}

interface MonthlySalesResponse {
  success: boolean;
  count: number;
  data: MonthlySales[];
}

export const getMonthlySalesApi = async (): Promise<MonthlySales[]> => {
  const response = await api.get<MonthlySalesResponse>(
    "/analytics/monthly-sales"
  );

  return response.data.data;
};

// =====================================================
// 3. TOP PRODUCTS
// =====================================================

export interface TopProduct {
  product_id: string;
  product_name: string;
  sku: string;
  brand: string;
  total_quantity_sold: number;
  total_revenue: string;
}

interface TopProductsResponse {
  success: boolean;
  count: number;
  data: TopProduct[];
}

export const getTopProductsApi = async (): Promise<TopProduct[]> => {
  const response = await api.get<TopProductsResponse>(
    "/analytics/top-products"
  );

  return response.data.data;
};

// =====================================================
// 4. LOW STOCK PRODUCTS
// =====================================================

export interface LowStockProduct {
  product_id: string;
  product_name: string;
  sku: string;
  brand: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  reorder_level: number;
}

interface LowStockResponse {
  success: boolean;
  count: number;
  data: LowStockProduct[];
}

export const getLowStockProductsApi = async (): Promise<
  LowStockProduct[]
> => {
  const response = await api.get<LowStockResponse>(
    "/analytics/low-stock"
  );

  return response.data.data;
};

// =====================================================
// 5. CUSTOMER COUNT
// =====================================================

interface CustomerCountResponse {
  success: boolean;
  data: {
    total_customers: number;
  };
}

export const getCustomerCountApi = async (): Promise<number> => {
  const response = await api.get<CustomerCountResponse>(
    "/analytics/customer-count"
  );

  return response.data.data.total_customers;
};

// =====================================================
// 6. PRODUCT COUNT
// =====================================================

interface ProductCountResponse {
  success: boolean;
  data: {
    total_products: number;
  };
}

export const getProductCountApi = async (): Promise<number> => {
  const response = await api.get<ProductCountResponse>(
    "/analytics/product-count"
  );

  return response.data.data.total_products;
};

// =====================================================
// COMMON RESPONSE TYPES
// =====================================================

interface AnalyticsListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

interface AnalyticsObjectResponse<T> {
  success: boolean;
  data: T;
}

// =====================================================
// 7. DAILY SALES
// =====================================================

export interface DailySales {
  sales_date: string;
  total_orders: number;
  total_sales: string;
  average_order_value: string;
}

export const getDailySalesApi = async (): Promise<DailySales[]> => {
  const response = await api.get<AnalyticsListResponse<DailySales>>(
    "/analytics/daily-sales"
  );

  return response.data.data;
};

// =====================================================
// 8. TOP CUSTOMERS
// =====================================================

export interface TopCustomer {
  customer_id: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  total_orders: number;
  total_revenue: string;
  average_order_value: string;
}

export const getTopCustomersApi = async (): Promise<TopCustomer[]> => {
  const response = await api.get<AnalyticsListResponse<TopCustomer>>(
    "/analytics/top-customers"
  );

  return response.data.data;
};

// =====================================================
// 9. CATEGORY SALES
// =====================================================

export interface CategorySales {
  category_id: string;
  category_name: string;
  total_products_sold: number;
  total_quantity_sold: number;
  total_revenue: string;
}

export const getCategorySalesApi = async (): Promise<CategorySales[]> => {
  const response = await api.get<AnalyticsListResponse<CategorySales>>(
    "/analytics/category-sales"
  );

  return response.data.data;
};

// =====================================================
// 10. PAYMENT METHOD SUMMARY
// =====================================================

export interface PaymentMethodSummary {
  payment_method: string;
  total_payments: number;
  total_amount: string;
}

export const getPaymentMethodSummaryApi = async (): Promise<
  PaymentMethodSummary[]
> => {
  const response = await api.get<
    AnalyticsListResponse<PaymentMethodSummary>
  >("/analytics/payment-methods");

  return response.data.data;
};

// =====================================================
// 11. INVENTORY VALUATION
// =====================================================

export interface InventoryValuationProduct {
  product_id: string;
  product_name: string;
  sku: string;
  quantity_on_hand: number;
  unit_cost: string;
  unit_price: string;
  inventory_cost_value: string;
  potential_selling_value: string;
}

export interface InventoryValuation {
  total_products: number;
  total_units: number;
  total_cost_value: string;
  total_selling_value: string;
  products: InventoryValuationProduct[];
}

export const getInventoryValuationApi = async (): Promise<
  InventoryValuation
> => {
  const response = await api.get<
    AnalyticsObjectResponse<InventoryValuation>
  >("/analytics/inventory-valuation");

  return response.data.data;
};

// =====================================================
// 12. STOCK MOVEMENT SUMMARY
// =====================================================

export interface StockMovementSummary {
  movement_type: string;
  total_movements: number;
  total_quantity: number;
}

export const getStockMovementSummaryApi = async (): Promise<
  StockMovementSummary[]
> => {
  const response = await api.get<
    AnalyticsListResponse<StockMovementSummary>
  >("/analytics/stock-movement-summary");

  return response.data.data;
};

// =====================================================
// 13. PURCHASE SUMMARY
// =====================================================

export interface PurchaseSummary {
  total_purchase_orders: number;
  total_purchase_value: string;
  average_purchase_order_value: string;
}

export interface PurchaseStatusSummary {
  status: string;
  total_orders: number;
  total_amount: string;
}

export interface PurchaseSummaryReport {
  summary: PurchaseSummary;
  status_breakdown: PurchaseStatusSummary[];
}

export const getPurchaseSummaryApi = async (): Promise<
  PurchaseSummaryReport
> => {
  const response = await api.get<
    AnalyticsObjectResponse<PurchaseSummaryReport>
  >("/analytics/purchase-summary");

  return response.data.data;
};

// =====================================================
// 14. VENDOR PURCHASE SUMMARY
// =====================================================

export interface VendorPurchaseSummary {
  vendor_id: string;
  vendor_name: string;
  total_purchase_orders: number;
  total_purchase_value: string;
  average_purchase_order_value: string;
}

export const getVendorPurchaseSummaryApi = async (): Promise<
  VendorPurchaseSummary[]
> => {
  const response = await api.get<
    AnalyticsListResponse<VendorPurchaseSummary>
  >("/analytics/vendor-purchases");

  return response.data.data;
};

// =====================================================
// 15. EXPENSE SUMMARY
// =====================================================

export interface ExpenseSummary {
  total_expense_records: number;
  total_expense_amount: string;
  average_expense_amount: string;
}

export interface ExpenseCategorySummary {
  expense_category: string;
  total_records: number;
  total_amount: string;
}

export interface ExpenseSummaryReport {
  summary: ExpenseSummary;
  category_breakdown: ExpenseCategorySummary[];
}

export const getExpenseSummaryApi = async (): Promise<
  ExpenseSummaryReport
> => {
  const response = await api.get<
    AnalyticsObjectResponse<ExpenseSummaryReport>
  >("/analytics/expense-summary");

  return response.data.data;
};

// =====================================================
// 16. REFUND SUMMARY
// =====================================================

export interface RefundSummary {
  total_refund_records: number;
  total_refund_amount: string;
  average_refund_amount: string;
}

export interface RefundStatusSummary {
  refund_status: string;
  total_records: number;
  total_amount: string;
}

export interface RefundReasonSummary {
  refund_reason: string;
  total_records: number;
  total_amount: string;
}

export interface RefundSummaryReport {
  summary: RefundSummary;
  status_breakdown: RefundStatusSummary[];
  reason_breakdown: RefundReasonSummary[];
}

export const getRefundSummaryApi = async (): Promise<
  RefundSummaryReport
> => {
  const response = await api.get<
    AnalyticsObjectResponse<RefundSummaryReport>
  >("/analytics/refund-summary");

  return response.data.data;
};
