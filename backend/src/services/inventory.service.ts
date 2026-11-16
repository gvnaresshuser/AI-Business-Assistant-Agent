
import {
  getAllInventory,
  getInventoryByProductId
} from "../repositories/inventory.repository.js";

import type {
  Inventory
} from "../repositories/inventory.repository.js";

export const fetchAllInventory = async (
  businessId: string
): Promise<Inventory[]> => {
  return await getAllInventory(businessId);
};

export const fetchInventoryByProductId = async (
  productId: string,
  businessId: string
): Promise<Inventory | null> => {
  return await getInventoryByProductId(productId, businessId);
};
