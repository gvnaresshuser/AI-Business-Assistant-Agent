
import {
  getAllVendors,
  getVendorById
} from "../repositories/vendor.repository.js";

import type { Vendor } from "../repositories/vendor.repository.js";

export const fetchAllVendors = async (
  businessId: string
): Promise<Vendor[]> => {
  return await getAllVendors(businessId);
};

export const fetchVendorById = async (
  vendorId: string,
  businessId: string
): Promise<Vendor | null> => {
  return await getVendorById(vendorId, businessId);
};
