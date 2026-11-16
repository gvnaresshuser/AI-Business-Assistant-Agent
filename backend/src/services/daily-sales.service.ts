
import {
  getDailySales,
  DailySales
} from "../repositories/daily-sales.repository.js";

// Fetch daily sales report
export const fetchDailySales = async (
  businessId: string
): Promise<DailySales[]> => {
  return await getDailySales(businessId);
};
