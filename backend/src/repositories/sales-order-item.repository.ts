
import { dbQuery } from "../utils/dbQuery.js";

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

export const getAllSalesOrderItems = async (
  businessId: string
): Promise<SalesOrderItem[]> => {
  const result = await dbQuery<SalesOrderItem>(
    `SELECT
      id,
      business_id,
      order_id,
      product_id,
      quantity,
      unit_price,
      unit_cost_snapshot,
      discount_amount,
      tax_amount,
      line_total
    FROM sales_order_items_biz_agent
    WHERE business_id = $1
    ORDER BY order_id`,
    [businessId]
  );

  return result.rows;
};

export const getSalesOrderItemsByOrderId = async (
  orderId: string,
  businessId: string
): Promise<SalesOrderItem[]> => {
  const result = await dbQuery<SalesOrderItem>(
    `SELECT
      id,
      business_id,
      order_id,
      product_id,
      quantity,
      unit_price,
      unit_cost_snapshot,
      discount_amount,
      tax_amount,
      line_total
    FROM sales_order_items_biz_agent
    WHERE order_id = $1 AND business_id = $2`,
    [orderId, businessId]
  );

  return result.rows;
};
