
import { dbQuery } from "../utils/dbQuery.js";

export interface RefundSummary {
  total_refund_records: number;
  total_refund_amount: string;
  average_refund_amount: string;
}

export interface RefundStatusSummary {
  refund_status: string;
  total_records: number;
  total_amount: string;
}

export interface RefundReasonSummary {
  refund_reason: string;
  total_records: number;
  total_amount: string;
}

export interface RefundSummaryReport {
  summary: RefundSummary;
  status_breakdown: RefundStatusSummary[];
  reason_breakdown: RefundReasonSummary[];
}

// Fetch overall refund summary
export const getRefundSummary = async (
  businessId: string
): Promise<RefundSummaryReport> => {
  const summaryResult = await dbQuery<RefundSummary>(
    `SELECT
      COUNT(*)::int AS total_refund_records,
      COALESCE(SUM(amount), 0)::numeric(14, 2)::text
        AS total_refund_amount,
      COALESCE(AVG(amount), 0)::numeric(14, 2)::text
        AS average_refund_amount
    FROM sales_refunds_biz_agent
    WHERE business_id = $1`,
    [businessId]
  );

  const statusResult = await dbQuery<RefundStatusSummary>(
    `SELECT
      COALESCE(refund_status, 'Unknown') AS refund_status,
      COUNT(*)::int AS total_records,
      COALESCE(SUM(amount), 0)::numeric(14, 2)::text
        AS total_amount
    FROM sales_refunds_biz_agent
    WHERE business_id = $1
    GROUP BY refund_status
    ORDER BY SUM(amount) DESC`,
    [businessId]
  );

  const reasonResult = await dbQuery<RefundReasonSummary>(
    `SELECT
      COALESCE(refund_reason, 'Unknown') AS refund_reason,
      COUNT(*)::int AS total_records,
      COALESCE(SUM(amount), 0)::numeric(14, 2)::text
        AS total_amount
    FROM sales_refunds_biz_agent
    WHERE business_id = $1
    GROUP BY refund_reason
    ORDER BY SUM(amount) DESC`,
    [businessId]
  );

  return {
    summary: summaryResult.rows[0],
    status_breakdown: statusResult.rows,
    reason_breakdown: reasonResult.rows
  };
};
