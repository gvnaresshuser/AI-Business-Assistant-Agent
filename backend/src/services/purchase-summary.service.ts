
import {
  getPurchaseSummary,
  PurchaseSummaryReport
} from "../repositories/purchase-summary.repository.js";

// Fetch purchase summary report
export const fetchPurchaseSummary = async (
  businessId: string
): Promise<PurchaseSummaryReport> => {
  return await getPurchaseSummary(businessId);
};
