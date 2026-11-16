
import {
  getInventoryValuation,
  InventoryValuation,
  InventoryValuationSummary
} from "../repositories/inventory-valuation.repository.js";

// Fetch inventory valuation report
export const fetchInventoryValuation = async (
  businessId: string
): Promise<InventoryValuationSummary & {
  products: InventoryValuation[];
}> => {
  return await getInventoryValuation(businessId);
};
