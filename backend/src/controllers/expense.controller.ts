
import type { Request, Response, NextFunction } from "express";

import {
  fetchAllExpenses,
  fetchExpenseById
} from "../services/expense.service.js";

export const getExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    const expenses = await fetchAllExpenses(businessId);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

export const getExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const expenseId = req.params.id;
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    if (typeof expenseId !== "string" || !expenseId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid expense ID is required"
      });
      return;
    }

    const expense = await fetchExpenseById(expenseId, businessId);

    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Expense not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};
