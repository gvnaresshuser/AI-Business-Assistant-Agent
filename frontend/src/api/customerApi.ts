
import api from "./axios";

// ============================================
// CUSTOMER TYPES
// ============================================

export interface Customer {
  id: string;
  business_id: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  customer_type: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateCustomerInput {
  customer_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  customer_type?: string | null;
}

export interface CustomerPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerStats {
  totalCustomers: number;
  customerTypes: {
    customer_type: string;
    count: number;
  }[];
}

export interface CustomerPurchase {
  id: string;
  business_id: string;
  customer_id: string;
  order_number: string;
  order_date: string;
  order_status: string | null;
  subtotal: string;
  discount_amount: string | null;
  tax_amount: string | null;
  shipping_amount: string | null;
  total_amount: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================
// API RESPONSE TYPES
// ============================================

interface CustomersResponse {
  success: boolean;
  count: number;
  data: Customer[];
}

interface CustomerResponse {
  success: boolean;
  message?: string;
  data: Customer;
}

interface PaginatedCustomersResponse {
  success: boolean;
  data: Customer[];
  pagination: CustomerPagination;
}

interface CustomerStatsResponse {
  success: boolean;
  data: CustomerStats;
}

interface CustomerPurchasesResponse {
  success: boolean;
  count: number;
  data: CustomerPurchase[];
}

// ============================================
// GET ALL CUSTOMERS
// ============================================

export const getCustomersApi = async (): Promise<Customer[]> => {
  const response = await api.get<CustomersResponse>("/customers");
  return response.data.data;
};

// ============================================
// GET PAGINATED CUSTOMERS
// ============================================

export const getCustomersPaginatedApi = async (
  page: number,
  limit: number,
  search: string = "",
  customerType: string = "all"
): Promise<PaginatedCustomersResponse> => {
  const response = await api.get<PaginatedCustomersResponse>(
    `/customers/pagination?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&customerType=${encodeURIComponent(customerType)}`
  );

  return response.data;
};

// ============================================
// GET CUSTOMER BY ID
// ============================================

export const getCustomerByIdApi = async (
  customerId: string
): Promise<Customer> => {
  const response = await api.get<CustomerResponse>(
    `/customers/${customerId}`
  );

  return response.data.data;
};

// ============================================
// CREATE CUSTOMER
// ============================================

export const createCustomerApi = async (
  customer: CreateCustomerInput
): Promise<Customer> => {
  const response = await api.post<CustomerResponse>(
    "/customers",
    customer
  );

  return response.data.data;
};

// ============================================
// UPDATE CUSTOMER
// ============================================

export const updateCustomerApi = async (
  customerId: string,
  customer: CreateCustomerInput
): Promise<Customer> => {
  const response = await api.put<CustomerResponse>(
    `/customers/${customerId}`,
    customer
  );

  return response.data.data;
};

// ============================================
// DELETE CUSTOMER
// ============================================

export const deleteCustomerApi = async (
  customerId: string
): Promise<void> => {
  await api.delete(`/customers/${customerId}`);
};

// ============================================
// GET CUSTOMER STATISTICS
// ============================================

export const getCustomerStatsApi = async (): Promise<CustomerStats> => {
  const response = await api.get<CustomerStatsResponse>(
    "/customers/stats"
  );

  return response.data.data;
};

// ============================================
// GET CUSTOMER PURCHASE HISTORY
// ============================================

export const getCustomerPurchaseHistoryApi = async (
  customerId: string
): Promise<CustomerPurchase[]> => {
  const response = await api.get<CustomerPurchasesResponse>(
    `/customers/${customerId}/purchases`
  );

  return response.data.data;
};
