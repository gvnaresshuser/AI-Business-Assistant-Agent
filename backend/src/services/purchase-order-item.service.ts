
import {
  getAllPurchaseOrderItems,
  getPurchaseOrderItemsByOrderId
} from "../repositories/purchase-order-item.repository.js";

import type {
  PurchaseOrderItem
} from "../repositories/purchase-order-item.repository.js";

export const fetchAllPurchaseOrderItems = async (
  businessId: string
): Promise<PurchaseOrderItem[]> => {
  return await getAllPurchaseOrderItems(businessId);
};

export const fetchPurchaseOrderItemsByOrderId = async (
  purchaseOrderId: string,
  businessId: string
): Promise<PurchaseOrderItem[]> => {
  return await getPurchaseOrderItemsByOrderId(
    purchaseOrderId,
    businessId
  );
};
