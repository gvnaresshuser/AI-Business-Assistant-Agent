
import { dbQuery } from "../utils/dbQuery.js";

export interface PurchaseOrder {
  id: string;
  business_id: string;
  vendor_id: string;
  purchase_order_number: string;
  order_date: string;
  expected_delivery_date: string | null;
  received_date: string | null;
  status: string | null;
  total_amount: string;
  notes: string | null;
  created_at: Date | null;
}

export const getAllPurchaseOrders = async (
  businessId: string
): Promise<PurchaseOrder[]> => {
  const result = await dbQuery<PurchaseOrder>(
    `SELECT
      id,
      business_id,
      vendor_id,
      purchase_order_number,
      order_date,
      expected_delivery_date,
      received_date,
      status,
      total_amount,
      notes,
      created_at
    FROM purch_purchase_orders_biz_agent
    WHERE business_id = $1
    ORDER BY order_date DESC`,
    [businessId]
  );

  return result.rows;
};

export const getPurchaseOrderById = async (
  purchaseOrderId: string,
  businessId: string
): Promise<PurchaseOrder | null> => {
  const result = await dbQuery<PurchaseOrder>(
    `SELECT
      id,
      business_id,
      vendor_id,
      purchase_order_number,
      order_date,
      expected_delivery_date,
      received_date,
      status,
      total_amount,
      notes,
      created_at
    FROM purch_purchase_orders_biz_agent
    WHERE id = $1 AND business_id = $2`,
    [purchaseOrderId, businessId]
  );

  return result.rows[0] ?? null;
};
