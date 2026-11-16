
import {
  getAllSalesRefunds,
  getSalesRefundById
} from "../repositories/sales-refund.repository.js";

// Fetch all refunds for a business
export const fetchAllSalesRefunds = async (
  businessId: string
) => {
  return await getAllSalesRefunds(businessId);
};

// Fetch a specific refund by ID
export const fetchSalesRefundById = async (
  refundId: string,
  businessId: string
) => {
  return await getSalesRefundById(refundId, businessId);
};
