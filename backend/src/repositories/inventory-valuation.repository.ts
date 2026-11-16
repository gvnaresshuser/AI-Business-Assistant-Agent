
import { dbQuery } from "../utils/dbQuery.js";

export interface InventoryValuation {
  product_id: string;
  product_name: string;
  sku: string;
  quantity_on_hand: number;
  unit_cost: string;
  unit_price: string;
  inventory_cost_value: string;
  potential_selling_value: string;
}

export interface InventoryValuationSummary {
  total_products: number;
  total_units: number;
  total_cost_value: string;
  total_selling_value: string;
}

// Fetch product-wise inventory valuation
export const getInventoryValuation = async (
  businessId: string
): Promise<InventoryValuationSummary & {
  products: InventoryValuation[];
}> => {
  const result = await dbQuery<InventoryValuation>(
    `SELECT
      p.id AS product_id,
      p.product_name,
      p.sku,
      i.quantity_on_hand,
      p.unit_cost::text AS unit_cost,
      p.unit_price::text AS unit_price,
      (i.quantity_on_hand * p.unit_cost)::numeric(14, 2)::text
        AS inventory_cost_value,
      (i.quantity_on_hand * p.unit_price)::numeric(14, 2)::text
        AS potential_selling_value
    FROM inv_inventory_biz_agent i
    INNER JOIN prod_products_biz_agent p
      ON p.id = i.product_id
      AND p.business_id = i.business_id
    WHERE i.business_id = $1
      AND p.is_active = TRUE
    ORDER BY (i.quantity_on_hand * p.unit_cost) DESC`,
    [businessId]
  );

  const summaryResult = await dbQuery<{
    total_products: number;
    total_units: number;
    total_cost_value: string;
    total_selling_value: string;
  }>(
    `SELECT
      COUNT(*)::int AS total_products,
      COALESCE(SUM(i.quantity_on_hand), 0)::int AS total_units,
      COALESCE(
        SUM(i.quantity_on_hand * p.unit_cost), 0
      )::numeric(14, 2)::text AS total_cost_value,
      COALESCE(
        SUM(i.quantity_on_hand * p.unit_price), 0
      )::numeric(14, 2)::text AS total_selling_value
    FROM inv_inventory_biz_agent i
    INNER JOIN prod_products_biz_agent p
      ON p.id = i.product_id
      AND p.business_id = i.business_id
    WHERE i.business_id = $1
      AND p.is_active = TRUE`,
    [businessId]
  );

  return {
    ...summaryResult.rows[0],
    products: result.rows
  };
};
