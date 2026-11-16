
import {
  getAllSalesOrderItems,
  getSalesOrderItemsByOrderId
} from "../repositories/sales-order-item.repository.js";

export const fetchAllSalesOrderItems = async (
  businessId: string
) => {
  return await getAllSalesOrderItems(businessId);
};

export const fetchSalesOrderItemsByOrderId = async (
  orderId: string,
  businessId: string
) => {
  return await getSalesOrderItemsByOrderId(
    orderId,
    businessId
  );
};
