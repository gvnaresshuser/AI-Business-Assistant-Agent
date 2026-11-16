
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

const inputSchema = z.object({
  businessId: z.string().uuid()
});

interface VendorPurchase {
  vendor_id: string;
  vendor_name: string;
  total_orders: number;
  total_purchase_value: string;
  average_order_value: string;
}

export const getVendorPurchases = async (
  input: { businessId: string }
): Promise<VendorPurchase[]> => {

  const { businessId } = inputSchema.parse(input);

  const result = await dbQuery<VendorPurchase>(
    `
    SELECT
      v.id AS vendor_id,
      v.vendor_name,

      COUNT(po.id)::integer
        AS total_orders,

      COALESCE(SUM(po.total_amount), 0)::numeric::text
        AS total_purchase_value,

      COALESCE(AVG(po.total_amount), 0)::numeric::text
        AS average_order_value

    FROM vend_vendors_biz_agent v

    LEFT JOIN purch_purchase_orders_biz_agent po
      ON po.vendor_id = v.id
      AND po.business_id = v.business_id

    WHERE v.business_id = $1

    GROUP BY
      v.id,
      v.vendor_name

    ORDER BY
      SUM(po.total_amount) DESC NULLS LAST,
      v.vendor_name ASC
    `,
    [businessId]
  );

  return result.rows;
};
