
import {
  getAllPurchaseOrders,
  getPurchaseOrderById
} from "../repositories/purchase-order.repository.js";

import type { PurchaseOrder } from "../repositories/purchase-order.repository.js";

export const fetchAllPurchaseOrders = async (
  businessId: string
): Promise<PurchaseOrder[]> => {
  return await getAllPurchaseOrders(businessId);
};

export const fetchPurchaseOrderById = async (
  purchaseOrderId: string,
  businessId: string
): Promise<PurchaseOrder | null> => {
  return await getPurchaseOrderById(purchaseOrderId, businessId);
};
