
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

const inputSchema = z.object({
  businessId: z.string().uuid()
});

interface InventoryValuation {
  product_id: string;
  product_name: string;
  sku: string;
  brand: string | null;
  quantity_on_hand: number;
  unit_cost: string;
  unit_price: string;
  total_cost_value: string;
  total_selling_value: string;
}

export const getInventoryValuation = async (
  input: { businessId: string }
): Promise<{
  summary: {
    total_products: number;
    total_units: number;
    total_cost_value: string;
    total_selling_value: string;
  };
  products: InventoryValuation[];
}> => {

  const { businessId } = inputSchema.parse(input);

  const result = await dbQuery<InventoryValuation>(
    `
    SELECT
      p.id AS product_id,
      p.product_name,
      p.sku,
      p.brand,

      i.quantity_on_hand,

      p.unit_cost::numeric::text AS unit_cost,
      p.unit_price::numeric::text AS unit_price,

      (
        i.quantity_on_hand * p.unit_cost
      )::numeric::text AS total_cost_value,

      (
        i.quantity_on_hand * p.unit_price
      )::numeric::text AS total_selling_value

    FROM inv_inventory_biz_agent i

    INNER JOIN prod_products_biz_agent p
      ON p.id = i.product_id
      AND p.business_id = i.business_id

    WHERE i.business_id = $1

    ORDER BY
      (i.quantity_on_hand * p.unit_cost) DESC
    `,
    [businessId]
  );

  const summary = await dbQuery<{
    total_products: number;
    total_units: number;
    total_cost_value: string;
    total_selling_value: string;
  }>(
    `
    SELECT
      COUNT(DISTINCT i.product_id)::integer
        AS total_products,

      COALESCE(SUM(i.quantity_on_hand), 0)::integer
        AS total_units,

      COALESCE(
        SUM(i.quantity_on_hand * p.unit_cost), 0
      )::numeric::text AS total_cost_value,

      COALESCE(
        SUM(i.quantity_on_hand * p.unit_price), 0
      )::numeric::text AS total_selling_value

    FROM inv_inventory_biz_agent i

    INNER JOIN prod_products_biz_agent p
      ON p.id = i.product_id
      AND p.business_id = i.business_id

    WHERE i.business_id = $1
    `,
    [businessId]
  );

  return {
    summary: summary.rows[0],
    products: result.rows
  };
};
