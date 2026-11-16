
import { dbQuery } from "../utils/dbQuery.js";

export interface Expense {
  id: string;
  business_id: string;
  expense_category: string;
  description: string | null;
  amount: string;
  expense_date: string;
  payment_method: string | null;
  reference_number: string | null;
  created_at: Date | null;
}

export const getAllExpenses = async (
  businessId: string
): Promise<Expense[]> => {
  const result = await dbQuery<Expense>(
    `SELECT
      id,
      business_id,
      expense_category,
      description,
      amount,
      expense_date,
      payment_method,
      reference_number,
      created_at
    FROM fin_expenses_biz_agent
    WHERE business_id = $1
    ORDER BY expense_date DESC`,
    [businessId]
  );

  return result.rows;
};

export const getExpenseById = async (
  expenseId: string,
  businessId: string
): Promise<Expense | null> => {
  const result = await dbQuery<Expense>(
    `SELECT
      id,
      business_id,
      expense_category,
      description,
      amount,
      expense_date,
      payment_method,
      reference_number,
      created_at
    FROM fin_expenses_biz_agent
    WHERE id = $1
      AND business_id = $2`,
    [expenseId, businessId]
  );

  return result.rows[0] ?? null;
};
