
import {
  getMonthlySales,
  MonthlySales
} from "../repositories/monthly-sales.repository.js";

// Fetch monthly sales report for a business
export const fetchMonthlySales = async (
  businessId: string
): Promise<MonthlySales[]> => {
  return await getMonthlySales(businessId);
};
