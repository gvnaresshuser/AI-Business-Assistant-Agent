
import {
  getAllSalesPayments,
  getSalesPaymentById
} from "../repositories/sales-payment.repository.js";

import type {
  SalesPayment
} from "../repositories/sales-payment.repository.js";

export const fetchAllSalesPayments = async (
  businessId: string
): Promise<SalesPayment[]> => {
  return await getAllSalesPayments(businessId);
};

export const fetchSalesPaymentById = async (
  paymentId: string,
  businessId: string
): Promise<SalesPayment | null> => {
  return await getSalesPaymentById(paymentId, businessId);
};
