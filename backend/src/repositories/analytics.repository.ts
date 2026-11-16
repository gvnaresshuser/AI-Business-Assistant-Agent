
import { dbQuery } from "../utils/dbQuery.js";

export interface SalesSummary {
  total_orders: number;
  total_sales: string;
  average_order_value: string;
}

// Fetch overall sales summary for a business

export const getSalesSummary = async (
  businessId: string,
  startDate?: string,
  endDate?: string
): Promise<SalesSummary> => {
  const result = await dbQuery<SalesSummary>(
    `SELECT
      COUNT(*)::int AS total_orders,
      COALESCE(SUM(total_amount), 0)::numeric(14, 2)::text AS total_sales,
      COALESCE(AVG(total_amount), 0)::numeric(14, 2)::text AS average_order_value
    FROM sales_orders_biz_agent
    WHERE business_id = $1
      AND ($2::date IS NULL OR order_date >= $2::date)
      AND ($3::date IS NULL OR order_date < ($3::date + INTERVAL '1 day'))`,
    [businessId, startDate ?? null, endDate ?? null]
  );

  return result.rows[0];
};

// Fetch total customer count for a business
export const getCustomerCount = async (
  businessId: string
): Promise<number> => {
  const result = await dbQuery<{ total_customers: number }>(
    `SELECT COUNT(*)::int AS total_customers
     FROM cust_customers_biz_agent
     WHERE business_id = $1`,
    [businessId]
  );

  return result.rows[0].total_customers;
};

// Fetch total product count for a business
export const getProductCount = async (
  businessId: string
): Promise<number> => {
  const result = await dbQuery<{ total_products: number }>(
    `SELECT COUNT(*)::int AS total_products
     FROM prod_products_biz_agent
     WHERE business_id = $1`,
    [businessId]
  );

  return result.rows[0].total_products;
};