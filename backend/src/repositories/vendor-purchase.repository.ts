
import { dbQuery } from "../utils/dbQuery.js";

export interface VendorPurchaseSummary {
  vendor_id: string;
  vendor_name: string;
  total_purchase_orders: number;
  total_purchase_value: string;
  average_purchase_order_value: string;
}

// Fetch vendor-wise purchase summary
export const getVendorPurchaseSummary = async (
  businessId: string
): Promise<VendorPurchaseSummary[]> => {
  const result = await dbQuery<VendorPurchaseSummary>(
    `SELECT
      v.id AS vendor_id,
      v.vendor_name,
      COUNT(po.id)::int AS total_purchase_orders,
      COALESCE(
        SUM(po.total_amount), 0
      )::numeric(14, 2)::text AS total_purchase_value,
      COALESCE(
        AVG(po.total_amount), 0
      )::numeric(14, 2)::text AS average_purchase_order_value
    FROM vend_vendors_biz_agent v
    LEFT JOIN purch_purchase_orders_biz_agent po
      ON po.vendor_id = v.id
      AND po.business_id = v.business_id
    WHERE v.business_id = $1
    GROUP BY v.id, v.vendor_name
    ORDER BY SUM(po.total_amount) DESC NULLS LAST`,
    [businessId]
  );

  return result.rows;
};
