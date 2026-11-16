
import {
  getAllExpenses,
  getExpenseById
} from "../repositories/expense.repository.js";

import type {
  Expense
} from "../repositories/expense.repository.js";

export const fetchAllExpenses = async (
  businessId: string
): Promise<Expense[]> => {
  return await getAllExpenses(businessId);
};

export const fetchExpenseById = async (
  expenseId: string,
  businessId: string
): Promise<Expense | null> => {
  return await getExpenseById(expenseId, businessId);
};
