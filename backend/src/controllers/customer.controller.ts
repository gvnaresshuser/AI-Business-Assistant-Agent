
import { Request, Response, NextFunction } from "express";

import {
  fetchAllCustomers,
  fetchCustomerById,
  fetchCustomersPaginated,
  addCustomer,
  modifyCustomer,
  removeCustomer,
  fetchCustomerStats,
  fetchCustomerPurchaseHistory,
} from "../services/customer.service.js";

// ============================================
// AUTHENTICATION HELPER
// ============================================

const getBusinessId = (req: Request, res: Response): string | null => {
  const businessId = req.user?.businessId;

  if (!businessId) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });

    return null;
  }

  return businessId;
};

// ============================================
// GET ALL CUSTOMERS
// GET /api/customers
// ============================================

export const getCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = getBusinessId(req, res);

    if (!businessId) return;

    const customers = await fetchAllCustomers(businessId);

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET CUSTOMERS WITH PAGINATION
// GET /api/customers/pagination
// ============================================

export const getCustomersPaginatedController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = getBusinessId(req, res);

    if (!businessId) return;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 10)
    );

    const search =
      typeof req.query.search === "string" ? req.query.search : "";

    const customerType =
      typeof req.query.customerType === "string"
        ? req.query.customerType
        : "all";

    const result = await fetchCustomersPaginated(
      businessId,
      page,
      limit,
      search,
      customerType
    );

    res.status(200).json({
      success: true,
      data: result.customers,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET CUSTOMER BY ID
// GET /api/customers/:id
// ============================================

export const getCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = getBusinessId(req, res);

    if (!businessId) return;

    const customerId = req.params.id;

    if (typeof customerId !== "string" || !customerId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid customer ID is required",
      });

      return;
    }

    const customer = await fetchCustomerById(
      customerId,
      businessId
    );

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// CREATE CUSTOMER
// POST /api/customers
// ============================================

export const createCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = getBusinessId(req, res);

    if (!businessId) return;

    const {
      customer_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      customer_type,
    } = req.body;

    if (
      typeof customer_name !== "string" ||
      !customer_name.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Customer name is required",
      });

      return;
    }

    if (customer_name.trim().length > 150) {
      res.status(400).json({
        success: false,
        message: "Customer name cannot exceed 150 characters",
      });

      return;
    }

    const customer = await addCustomer(businessId, {
      customer_name: customer_name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      state: state?.trim() || null,
      pincode: pincode?.trim() || null,
      customer_type: customer_type || "Regular",
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE CUSTOMER
// PUT /api/customers/:id
// ============================================

export const updateCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = getBusinessId(req, res);

    if (!businessId) return;

    const customerId = req.params.id;

    if (typeof customerId !== "string" || !customerId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid customer ID is required",
      });

      return;
    }

    const {
      customer_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      customer_type,
    } = req.body;

    if (
      typeof customer_name !== "string" ||
      !customer_name.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Customer name is required",
      });

      return;
    }

    if (customer_name.trim().length > 150) {
      res.status(400).json({
        success: false,
        message: "Customer name cannot exceed 150 characters",
      });

      return;
    }

    const customer = await modifyCustomer(
      customerId,
      businessId,
      {
        customer_name: customer_name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        pincode: pincode?.trim() || null,
        customer_type: customer_type || "Regular",
      }
    );

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// DELETE CUSTOMER
// DELETE /api/customers/:id
// ============================================

export const deleteCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = getBusinessId(req, res);

    if (!businessId) return;

    const customerId = req.params.id;

    if (typeof customerId !== "string" || !customerId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid customer ID is required",
      });

      return;
    }

    const deleted = await removeCustomer(
      customerId,
      businessId
    );

    if (!deleted) {
      const customer = await fetchCustomerById(
        customerId,
        businessId
      );

      if (!customer) {
        res.status(404).json({
          success: false,
          message: "Customer not found",
        });

        return;
      }

      res.status(409).json({
        success: false,
        message:
          "This customer has existing sales orders and cannot be deleted.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET CUSTOMER STATISTICS
// GET /api/customers/stats
// ============================================

export const getCustomerStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = getBusinessId(req, res);

    if (!businessId) return;

    const stats = await fetchCustomerStats(businessId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET CUSTOMER PURCHASE HISTORY
// GET /api/customers/:id/purchases
// ============================================

export const getCustomerPurchaseHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = getBusinessId(req, res);

    if (!businessId) return;

    const customerId = req.params.id;

    if (typeof customerId !== "string" || !customerId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid customer ID is required",
      });

      return;
    }

    const customer = await fetchCustomerById(
      customerId,
      businessId
    );

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });

      return;
    }

    const purchases = await fetchCustomerPurchaseHistory(
      customerId,
      businessId
    );

    res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases,
    });
  } catch (error) {
    next(error);
  }
};
