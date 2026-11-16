
import {
  getVendorPurchaseSummary,
  VendorPurchaseSummary
} from "../repositories/vendor-purchase.repository.js";

// Fetch vendor-wise purchase summary
export const fetchVendorPurchaseSummary = async (
  businessId: string
): Promise<VendorPurchaseSummary[]> => {
  return await getVendorPurchaseSummary(businessId);
};
