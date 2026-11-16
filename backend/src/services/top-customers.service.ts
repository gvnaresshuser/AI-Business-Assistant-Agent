
import {
  getTopCustomers,
  TopCustomer
} from "../repositories/top-customers.repository.js";

// Fetch top 5 customers by sales revenue
export const fetchTopCustomers = async (
  businessId: string
): Promise<TopCustomer[]> => {
  return await getTopCustomers(businessId);
};
