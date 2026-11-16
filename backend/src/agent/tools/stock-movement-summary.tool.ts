
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

const inputSchema = z.object({
  businessId: z.string().uuid()
});

interface StockMovementSummary {
  movement_type: string;
  total_movements: number;
  total_quantity: number;
}

export const getStockMovementSummary = async (
  input: { businessId: string }
): Promise<StockMovementSummary[]> => {

  const { businessId } = inputSchema.parse(input);

  const result = await dbQuery<StockMovementSummary>(
    `
    SELECT
      movement_type,

      COUNT(id)::integer
        AS total_movements,

      COALESCE(SUM(quantity), 0)::integer
        AS total_quantity

    FROM inv_stock_movements_biz_agent

    WHERE business_id = $1

    GROUP BY movement_type

    ORDER BY total_movements DESC
    `,
    [businessId]
  );

  return result.rows;
};
