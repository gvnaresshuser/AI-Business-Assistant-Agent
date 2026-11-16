
import { dbQuery } from "../utils/dbQuery.js";

export interface ExpenseSummary {
  total_expense_records: number;
  total_expense_amount: string;
  average_expense_amount: string;
}

export interface ExpenseCategorySummary {
  expense_category: string;
  total_records: number;
  total_amount: string;
}

export interface ExpenseSummaryReport {
  summary: ExpenseSummary;
  category_breakdown: ExpenseCategorySummary[];
}

// Fetch overall expense summary
export const getExpenseSummary = async (
  businessId: string
): Promise<ExpenseSummaryReport> => {
  const summaryResult = await dbQuery<ExpenseSummary>(
    `SELECT
      COUNT(*)::int AS total_expense_records,
      COALESCE(SUM(amount), 0)::numeric(14, 2)::text
        AS total_expense_amount,
      COALESCE(AVG(amount), 0)::numeric(14, 2)::text
        AS average_expense_amount
    FROM fin_expenses_biz_agent
    WHERE business_id = $1`,
    [businessId]
  );

  const categoryResult = await dbQuery<ExpenseCategorySummary>(
    `SELECT
      expense_category,
      COUNT(*)::int AS total_records,
      COALESCE(SUM(amount), 0)::numeric(14, 2)::text
        AS total_amount
    FROM fin_expenses_biz_agent
    WHERE business_id = $1
    GROUP BY expense_category
    ORDER BY SUM(amount) DESC`,
    [businessId]
  );

  return {
    summary: summaryResult.rows[0],
    category_breakdown: categoryResult.rows
  };
};
