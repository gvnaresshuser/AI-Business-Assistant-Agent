
import api from "./axios";

// ============================================
// SALES ORDER TYPES
// ============================================

export interface SalesOrder {
  id: string;
  business_id: string;
  customer_id: string;
  order_number: string;
  order_date: string;
  order_status: string | null;
  subtotal: string;
  discount_amount: string | null;
  tax_amount: string | null;
  shipping_amount: string | null;
  total_amount: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================
// SALES ORDER ITEM TYPES
// ============================================

export interface SalesOrderItem {
  id: string;
  business_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: string;
  unit_cost_snapshot: string;
  discount_amount: string | null;
  tax_amount: string | null;
  line_total: string;
}

// ============================================
// SALES PAYMENT TYPES
// ============================================

export interface SalesPayment {
  id: string;
  business_id: string;
  order_id: string;
  payment_reference: string | null;
  payment_date: string | null;
  payment_method: string | null;
  payment_status: string | null;
  amount: string;
}

// ============================================
// SALES REFUND TYPES
// ============================================

export interface SalesRefund {
  id: string;
  business_id: string;
  order_id: string;
  payment_id: string | null;
  refund_reference: string | null;
  refund_date: string | null;
  refund_reason: string | null;
  refund_status: string | null;
  amount: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

interface SalesOrdersResponse {
  success: boolean;
  count: number;
  data: SalesOrder[];
}

interface SalesOrderResponse {
  success: boolean;
  data: SalesOrder;
}

interface SalesOrderItemsResponse {
  success: boolean;
  count: number;
  data: SalesOrderItem[];
}

interface SalesPaymentsResponse {
  success: boolean;
  count: number;
  data: SalesPayment[];
}

interface SalesPaymentResponse {
  success: boolean;
  data: SalesPayment;
}

interface SalesRefundsResponse {
  success: boolean;
  count: number;
  data: SalesRefund[];
}

interface SalesRefundResponse {
  success: boolean;
  data: SalesRefund;
}

// ============================================
// GET ALL SALES ORDERS
// ============================================

export const getSalesOrdersApi = async (): Promise<SalesOrder[]> => {
  const response = await api.get<SalesOrdersResponse>(
    "/sales-orders"
  );

  return response.data.data;
};

// ============================================
// GET SALES ORDER BY ID
// ============================================

export const getSalesOrderByIdApi = async (
  orderId: string
): Promise<SalesOrder> => {
  const response = await api.get<SalesOrderResponse>(
    `/sales-orders/${orderId}`
  );

  return response.data.data;
};

// ============================================
// GET ALL SALES ORDER ITEMS
// ============================================

export const getSalesOrderItemsApi = async (): Promise<SalesOrderItem[]> => {
  const response = await api.get<SalesOrderItemsResponse>(
    "/sales-order-items"
  );

  return response.data.data;
};

// ============================================
// GET SALES ORDER ITEMS BY ORDER ID
// ============================================

export const getSalesOrderItemsByOrderApi = async (
  orderId: string
): Promise<SalesOrderItem[]> => {
  const response = await api.get<SalesOrderItemsResponse>(
    `/sales-order-items/order/${orderId}`
  );

  return response.data.data;
};

// ============================================
// GET ALL SALES PAYMENTS
// ============================================

export const getSalesPaymentsApi = async (): Promise<SalesPayment[]> => {
  const response = await api.get<SalesPaymentsResponse>(
    "/sales-payments"
  );

  return response.data.data;
};

// ============================================
// GET SALES PAYMENT BY ID
// ============================================

export const getSalesPaymentByIdApi = async (
  paymentId: string
): Promise<SalesPayment> => {
  const response = await api.get<SalesPaymentResponse>(
    `/sales-payments/${paymentId}`
  );

  return response.data.data;
};

// ============================================
// GET ALL SALES REFUNDS
// ============================================

export const getSalesRefundsApi = async (): Promise<SalesRefund[]> => {
  const response = await api.get<SalesRefundsResponse>(
    "/sales-refunds"
  );

  return response.data.data;
};

// ============================================
// GET SALES REFUND BY ID
// ============================================

export const getSalesRefundByIdApi = async (
  refundId: string
): Promise<SalesRefund> => {
  const response = await api.get<SalesRefundResponse>(
    `/sales-refunds/${refundId}`
  );

  return response.data.data;
};
