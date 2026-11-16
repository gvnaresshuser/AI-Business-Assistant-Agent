
import {
  getExpenseSummary,
  ExpenseSummaryReport
} from "../repositories/expense-summary.repository.js";

// Fetch expense summary report
export const fetchExpenseSummary = async (
  businessId: string
): Promise<ExpenseSummaryReport> => {
  return await getExpenseSummary(businessId);
};
