
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(255),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long")
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .max(128, "Password is too long"),

    newPassword: z
      .string()
      .min(8, "New password must contain at least 8 characters")
      .max(128, "Password is too long"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password")
      .max(128, "Password is too long")
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: "New password and confirm password do not match",
      path: ["confirmPassword"]
    }
  );

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
