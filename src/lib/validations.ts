import { z } from "zod";

// Authentication schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

// Facility management schemas
export const facilitySchema = z.object({
  // Required fields
  name: z.string().min(1, "Facility name is required"),
  code: z.string().min(1, "Facility code is required"),
  ward_code: z.string().min(1, "Ward is required"),

  // Location fields for UI (will be converted to ward_code)
  county_id: z.string().min(1, "County is required"),
  sub_county_id: z.string().min(1, "Sub county is required"),

  // Optional fields
  regulatory_status: z.string().optional(),
  facility_type: z.string().optional(),
  owner: z.string().optional(),
  keph_level: z.string().optional(),
  operation_status: z.string().optional(),

  // DHA credentials (optional)
  dha_pass_id: z.string().optional(),
  dha_username: z.string().optional(),
  dha_code: z.string().optional(),
  dha_agent: z.string().optional(),
  dha_key: z.string().optional(),
  dha_secret: z.string().optional(),
  public_key: z.string().optional(),
  private_key: z.string().optional(),
});

// Vendor management schemas
export const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  code: z.string().min(1, "Vendor code is required"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  contact_person: z.string().optional(),
  is_active: z.boolean().optional(),
});

// Report schemas
export const reportFormSchema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
});

// Simple lot creation schema for new lot form
export const lotCreationSchema = z.object({
  number: z.string().min(1, "Lot number is required"),
  name: z.string().min(2, "Lot name must be at least 2 characters"),
  is_active: z.boolean().optional(),
});

// Service schemas
export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  code: z.string().min(1, "Service code is required"),
  tariff: z.number().min(0, "Tariff must be positive"),
  vendor_share: z.number().min(0, "Vendor share must be positive"),
  facility_share: z.number().min(0, "Facility share must be positive"),
  capitated: z.boolean(),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type FacilityFormData = z.infer<typeof facilitySchema>;
export type VendorFormData = z.infer<typeof vendorSchema>;
export type ReportFormData = z.infer<typeof reportFormSchema>;
export type LotCreationFormData = z.infer<typeof lotCreationSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
