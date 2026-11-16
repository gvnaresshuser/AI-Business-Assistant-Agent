
import {
  getAllCustomers,
  getCustomerById,
  getCustomersPaginated,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  getCustomerPurchaseHistory,
  type CreateCustomerInput,
} from "../repositories/customer.repository.js";

// ============================================
// GET ALL CUSTOMERS
// ============================================

export const fetchAllCustomers = async (businessId: string) => {
  return await getAllCustomers(businessId);
};

// ============================================
// GET CUSTOMER BY ID
// ============================================

export const fetchCustomerById = async (
  customerId: string,
  businessId: string
) => {
  return await getCustomerById(customerId, businessId);
};

// ============================================
// GET CUSTOMERS WITH PAGINATION
// ============================================

export const fetchCustomersPaginated = async (
  businessId: string,
  page: number,
  limit: number,
  search: string = "",
  customerType: string = "all"
) => {
  return await getCustomersPaginated(
    businessId,
    page,
    limit,
    search,
    customerType
  );
};

// ============================================
// CREATE CUSTOMER
// ============================================

export const addCustomer = async (
  businessId: string,
  customer: CreateCustomerInput
) => {
  return await createCustomer(businessId, customer);
};

// ============================================
// UPDATE CUSTOMER
// ============================================

export const modifyCustomer = async (
  customerId: string,
  businessId: string,
  customer: CreateCustomerInput
) => {
  return await updateCustomer(customerId, businessId, customer);
};

// ============================================
// DELETE CUSTOMER
// ============================================

export const removeCustomer = async (
  customerId: string,
  businessId: string
) => {
  return await deleteCustomer(customerId, businessId);
};

// ============================================
// GET CUSTOMER STATISTICS
// ============================================

export const fetchCustomerStats = async (businessId: string) => {
  return await getCustomerStats(businessId);
};

// ============================================
// GET CUSTOMER PURCHASE HISTORY
// ============================================

export const fetchCustomerPurchaseHistory = async (
  customerId: string,
  businessId: string
) => {
  return await getCustomerPurchaseHistory(customerId, businessId);
};
