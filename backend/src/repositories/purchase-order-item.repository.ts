
import { dbQuery } from "../utils/dbQuery.js";

export interface PurchaseOrderItem {
  id: string;
  business_id: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  received_quantity: number | null;
  unit_cost: string;
  line_total: string;
}

export const getAllPurchaseOrderItems = async (
  businessId: string
): Promise<PurchaseOrderItem[]> => {
  const result = await dbQuery<PurchaseOrderItem>(
    `SELECT
      id,
      business_id,
      purchase_order_id,
      product_id,
      quantity,
      received_quantity,
      unit_cost,
      line_total
    FROM purch_purchase_items_biz_agent
    WHERE business_id = $1
    ORDER BY purchase_order_id`,
    [businessId]
  );

  return result.rows;
};

export const getPurchaseOrderItemsByOrderId = async (
  purchaseOrderId: string,
  businessId: string
): Promise<PurchaseOrderItem[]> => {
  const result = await dbQuery<PurchaseOrderItem>(
    `SELECT
      id,
      business_id,
      purchase_order_id,
      product_id,
      quantity,
      received_quantity,
      unit_cost,
      line_total
    FROM purch_purchase_items_biz_agent
    WHERE purchase_order_id = $1
      AND business_id = $2`,
    [purchaseOrderId, businessId]
  );

  return result.rows;
};
