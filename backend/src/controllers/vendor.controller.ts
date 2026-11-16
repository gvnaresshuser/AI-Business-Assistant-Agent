
import type { Request, Response, NextFunction } from "express";

import {
  fetchAllVendors,
  fetchVendorById
} from "../services/vendor.service.js";

export const getVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    const vendors = await fetchAllVendors(businessId);

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    next(error);
  }
};

export const getVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vendorId = req.params.id;
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    if (typeof vendorId !== "string" || !vendorId.trim()) {
      res.status(400).json({
        success: false,
        message: "Valid vendor ID is required"
      });
      return;
    }

    const vendor = await fetchVendorById(vendorId, businessId);

    if (!vendor) {
      res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};
