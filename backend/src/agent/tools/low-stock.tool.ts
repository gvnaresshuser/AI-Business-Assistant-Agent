
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

const inputSchema = z.object({
  businessId: z.string().uuid()
});

interface LowStockProduct {
  product_id: string;
  product_name: string;
  brand: string | null;
  sku: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  reorder_level: number;
}

export const getLowStockProducts = async (
  input: { businessId: string }
): Promise<LowStockProduct[]> => {

  const { businessId } = inputSchema.parse(input);

  const result = await dbQuery<LowStockProduct>(
    `
    SELECT
      p.id AS product_id,
      p.product_name,
      p.brand,
      p.sku,
      i.quantity_on_hand,
      i.quantity_reserved,
      COALESCE(
        i.quantity_available,
        i.quantity_on_hand - i.quantity_reserved
      ) AS quantity_available,
      p.reorder_level
    FROM inv_inventory_biz_agent i
    INNER JOIN prod_products_biz_agent p
      ON p.id = i.product_id
      AND p.business_id = i.business_id
    WHERE
      i.business_id = $1
      AND p.is_active = TRUE
      AND p.reorder_level IS NOT NULL
      AND COALESCE(
        i.quantity_available,
        i.quantity_on_hand - i.quantity_reserved
      ) <= p.reorder_level
    ORDER BY
      quantity_available ASC,
      p.product_name ASC
    `,
    [businessId]
  );

  return result.rows;
};
