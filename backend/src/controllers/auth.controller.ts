
import type { Request, Response } from "express";

import {
  loginUser,
  changeUserPassword
} from "../services/auth.service.js";
import {
  loginSchema,
  changePasswordSchema
} from "../validators/auth.validator.js";
import type { AuthenticatedRequestUser } from "../middleware/auth.middleware.js";

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate login request
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid login details",
        errors: validation.error.flatten().fieldErrors
      });
      return;
    }

    const { email, password } = validation.data;

    // Authenticate user
    const result = await loginUser(email, password);

    // Store JWT in an HTTP-only cookie
    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/"
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user
    });

  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";

    if (
      message === "Invalid email or password" ||
      message === "Your account is inactive" ||
      message === "Your business account is inactive"
    ) {
      res.status(401).json({
        success: false,
        message
      });
      return;
    }

    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process login"
    });
  }
};


export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as AuthenticatedRequestUser;

    res.status(200).json({
      success: true,
      message: "Authenticated user retrieved successfully",
      user
    });

  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve current user"
    });
  }
};
export const logout = async (
  _req: Request,
  res: Response
): Promise<void> => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  res.status(200).json({
    success: true,
    message: "Logout successful"
  });
};
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate password-change request
    const validation = changePasswordSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid password details",
        errors: validation.error.flatten().fieldErrors
      });
      return;
    }

    // Get authenticated user details
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
      return;
    }

    const { currentPassword, newPassword } = validation.data;

    // Change password
    await changeUserPassword(
      user.userId,
      user.businessId,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again."
    });

  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Password change failed";

    if (
      message === "Current password is incorrect" ||
      message === "New password must be different from current password" ||
      message === "User account is unavailable"
    ) {
      res.status(400).json({
        success: false,
        message
      });
      return;
    }

    console.error("Change password error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to change password"
    });
  }
};