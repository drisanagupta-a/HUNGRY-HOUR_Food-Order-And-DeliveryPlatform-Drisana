import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.")
  .max(254, "Email must be 254 characters or fewer.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required.")
    .max(128, "Password must be 128 characters or fewer."),
  rememberMe: z.boolean(),
});

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(60, "Name must be 60 characters or fewer."),
    email: emailSchema,
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    acceptTerms: z.boolean().refine((accepted) => accepted, {
      message: "You must accept the terms and conditions.",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const otpSchema = z.object({
  token: z
    .string()
    .regex(/^\d{6}$/, "Enter the six-digit code sent to your email."),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });