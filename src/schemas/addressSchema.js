import { z } from "zod";

export const addressSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Address label is required (e.g. Home, Work).")
    .max(50, "Label must be 50 characters or fewer."),
  fullAddress: z
    .string()
    .trim()
    .min(10, "Please enter a complete address (at least 10 characters).")
    .max(500, "Address cannot exceed 500 characters."),
  street: z
    .string()
    .trim()
    .max(255, "Street must be 255 characters or fewer.")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .max(100, "City must be 100 characters or fewer.")
    .optional()
    .or(z.literal("")),
  state: z
    .string()
    .trim()
    .max(100, "State must be 100 characters or fewer.")
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .trim()
    .max(20, "Postal code must be 20 characters or fewer.")
    .optional()
    .or(z.literal("")),
  deliveryInstructions: z
    .string()
    .trim()
    .max(500, "Delivery instructions cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
  isDefault: z.boolean().default(false),
});

export const deliveryAddressSchema = addressSchema;

