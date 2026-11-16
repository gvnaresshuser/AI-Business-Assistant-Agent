
import {
  getPaymentMethodSummary,
  PaymentMethodSummary
} from "../repositories/payment-method.repository.js";

// Fetch payment summary grouped by payment method
export const fetchPaymentMethodSummary = async (
  businessId: string
): Promise<PaymentMethodSummary[]> => {
  return await getPaymentMethodSummary(businessId);
};
