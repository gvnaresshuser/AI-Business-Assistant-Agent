
import {
  getAllSalesOrders,
  getSalesOrderById
} from "../repositories/sales-order.repository.js";

export const fetchAllSalesOrders = async (
  businessId: string
) => {
  return await getAllSalesOrders(businessId);
};

export const fetchSalesOrderById = async (
  orderId: string,
  businessId: string
) => {
  return await getSalesOrderById(orderId, businessId);
};
