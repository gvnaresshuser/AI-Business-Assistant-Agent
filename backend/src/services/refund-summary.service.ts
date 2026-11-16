
import {
  getRefundSummary,
  RefundSummaryReport
} from "../repositories/refund-summary.repository.js";

// Fetch refund summary report
export const fetchRefundSummary = async (
  businessId: string
): Promise<RefundSummaryReport> => {
  return await getRefundSummary(businessId);
};
