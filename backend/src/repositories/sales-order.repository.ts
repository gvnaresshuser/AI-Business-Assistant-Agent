
import { dbQuery } from "../utils/dbQuery.js";

export interface SalesOrder {
  id: string;
  business_id: string;
  customer_id: string;
  order_number: string;
  order_date: Date;
  order_status: string | null;
  subtotal: string;
  discount_amount: string | null;
  tax_amount: string | null;
  shipping_amount: string | null;
  total_amount: string;
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export const getAllSalesOrders = async (
  businessId: string
): Promise<SalesOrder[]> => {
  const result = await dbQuery<SalesOrder>(
    `SELECT
      id,
      business_id,
      customer_id,
      order_number,
      order_date,
      order_status,
      subtotal,
      discount_amount,
      tax_amount,
      shipping_amount,
      total_amount,
      notes,
      created_at,
      updated_at
    FROM sales_orders_biz_agent
    WHERE business_id = $1
    ORDER BY order_date DESC`,
    [businessId]
  );

  return result.rows;
};

export const getSalesOrderById = async (
  orderId: string,
  businessId: string
): Promise<SalesOrder | null> => {
  const result = await dbQuery<SalesOrder>(
    `SELECT
      id,
      business_id,
      customer_id,
      order_number,
      order_date,
      order_status,
      subtotal,
      discount_amount,
      tax_amount,
      shipping_amount,
      total_amount,
      notes,
      created_at,
      updated_at
    FROM sales_orders_biz_agent
    WHERE id = $1 AND business_id = $2`,
    [orderId, businessId]
  );

  return result.rows[0] ?? null;
};
