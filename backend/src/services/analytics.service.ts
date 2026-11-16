
import {
  getSalesSummary,
  getCustomerCount,
  getProductCount,
  SalesSummary,
} from "../repositories/analytics.repository.js";

// Fetch sales summary for a business with optional date filters
export const fetchSalesSummary = async (
  businessId: string,
  startDate?: string,
  endDate?: string
): Promise<SalesSummary> => {
  return await getSalesSummary(businessId, startDate, endDate);
};
// Fetch total customer count
export const fetchCustomerCount = async (
  businessId: string
): Promise<number> => {
  return await getCustomerCount(businessId);
};

// Fetch total product count
export const fetchProductCount = async (
  businessId: string
): Promise<number> => {
  return await getProductCount(businessId);
};