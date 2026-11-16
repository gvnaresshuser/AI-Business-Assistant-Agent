
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

const inputSchema = z.object({
  businessId: z.string().uuid()
});

interface RefundStatusSummary {
  refund_status: string;
  total_refunds: number;
  total_amount: string;
}

interface RefundReasonSummary {
  refund_reason: string;
  total_refunds: number;
  total_amount: string;
}

interface RefundSummary {
  total_refund_records: number;
  total_refund_amount: string;
  average_refund_amount: string;
  status_breakdown: RefundStatusSummary[];
  reason_breakdown: RefundReasonSummary[];
}

export const getRefundSummary = async (
  input: { businessId: string }
): Promise<RefundSummary> => {

  const { businessId } = inputSchema.parse(input);

  // Overall refund summary
  const summaryResult = await dbQuery<{
    total_refund_records: number;
    total_refund_amount: string;
    average_refund_amount: string;
  }>(
    `
    SELECT
      COUNT(id)::integer
        AS total_refund_records,

      COALESCE(SUM(amount), 0)::numeric::text
        AS total_refund_amount,

      COALESCE(AVG(amount), 0)::numeric::text
        AS average_refund_amount

    FROM sales_refunds_biz_agent

    WHERE business_id = $1
    `,
    [businessId]
  );

  // Refund breakdown by status
  const statusResult = await dbQuery<RefundStatusSummary>(
    `
    SELECT
      refund_status,

      COUNT(id)::integer
        AS total_refunds,

      COALESCE(SUM(amount), 0)::numeric::text
        AS total_amount

    FROM sales_refunds_biz_agent

    WHERE business_id = $1

    GROUP BY refund_status

    ORDER BY SUM(amount) DESC
    `,
    [businessId]
  );

  // Refund breakdown by reason
  const reasonResult = await dbQuery<RefundReasonSummary>(
    `
    SELECT
      refund_reason,

      COUNT(id)::integer
        AS total_refunds,

      COALESCE(SUM(amount), 0)::numeric::text
        AS total_amount

    FROM sales_refunds_biz_agent

    WHERE business_id = $1

    GROUP BY refund_reason

    ORDER BY SUM(amount) DESC
    `,
    [businessId]
  );

  return {
    ...summaryResult.rows[0],
    status_breakdown: statusResult.rows,
    reason_breakdown: reasonResult.rows
  };
};
