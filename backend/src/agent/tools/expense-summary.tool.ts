
import { z } from "zod";
import { dbQuery } from "../../utils/dbQuery.js";

const inputSchema = z.object({
  businessId: z.string().uuid()
});

interface ExpenseCategorySummary {
  expense_category: string;
  total_records: number;
  total_amount: string;
}

interface ExpenseSummary {
  total_expense_records: number;
  total_expense_amount: string;
  average_expense_amount: string;
  category_breakdown: ExpenseCategorySummary[];
}

export const getExpenseSummary = async (
  input: { businessId: string }
): Promise<ExpenseSummary> => {

  const { businessId } = inputSchema.parse(input);

  const summaryResult = await dbQuery<{
    total_expense_records: number;
    total_expense_amount: string;
    average_expense_amount: string;
  }>(
    `
    SELECT
      COUNT(id)::integer
        AS total_expense_records,

      COALESCE(SUM(amount), 0)::numeric::text
        AS total_expense_amount,

      COALESCE(AVG(amount), 0)::numeric::text
        AS average_expense_amount

    FROM fin_expenses_biz_agent

    WHERE business_id = $1
    `,
    [businessId]
  );

  const categoryResult = await dbQuery<ExpenseCategorySummary>(
    `
    SELECT
      expense_category,

      COUNT(id)::integer
        AS total_records,

      COALESCE(SUM(amount), 0)::numeric::text
        AS total_amount

    FROM fin_expenses_biz_agent

    WHERE business_id = $1

    GROUP BY expense_category

    ORDER BY SUM(amount) DESC
    `,
    [businessId]
  );

  return {
    ...summaryResult.rows[0],
    category_breakdown: categoryResult.rows
  };
};
