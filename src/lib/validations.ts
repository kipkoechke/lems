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

/**
 * Setting a new password from an emailed link. The API requires at least 8
 * characters and its own confirmation, so both are checked here first rather
 * than spending a round trip and a single-use token on a typo.
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "The passwords do not match",
    path: ["password_confirmation"],
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

/**
 * Editing an existing facility.
 *
 * The edit form does not ask for the location again — the ward is fixed once a
 * facility is registered — so this is not simply the create schema. The
 * classification fields the API requires on update are required here.
 */
export const facilityEditSchema = z.object({
  name: z.string().min(1, "Facility name is required"),
  code: z.string().min(1, "Facility code is required"),
  keph_level: z.string().min(1, "KEPH level is required"),
  facility_type: z.string().min(1, "Facility type is required"),
  owner: z.string().min(1, "Ownership is required"),
  operation_status: z.string().optional(),
  regulatory_status: z.string().optional(),
  is_active: z.string().optional(),
  ward_id: z.string().optional(),
  sub_county_id: z.string().optional(),
  county_id: z.string().optional(),
});

/** The inline rename dialog on the facility list touches only these two. */
export const facilityRenameSchema = z.object({
  name: z.string().min(1, "Facility name is required"),
  code: z.string().min(1, "Facility code is required"),
});

// Vendor management schemas
export const vendorSchema = z.object({
  vendor_alpha_code: z
    .string()
    .min(1, "Vendor code is required")
    .max(10, "Vendor code must be 10 characters or less"),
  dha_vendor_code: z
    .string()
    .min(1, "DHA vendor code is required")
    .max(50, "DHA vendor code must be 50 characters or less"),
  sha_vendor_code: z
    .string()
    .min(1, "SHA vendor code is required")
    .max(50, "SHA vendor code must be 50 characters or less"),
  name: z.string().min(1, "Vendor name is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  lifecycle_state: z.enum(["active", "disabled", "retired"]).optional(),
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

// ============================================================
// Users
// ============================================================

/**
 * Creating a user.
 *
 * No password: accounts are handed over by a welcome email carrying a
 * single-use link. The API takes either an email or a phone number but needs
 * one of them to reach the person, which is why that rule sits on the object
 * rather than on a field.
 */
export const userCreateSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    role: z.string().min(1, "Role is required"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .or(z.literal(""))
      .optional(),
    phone: z.string().optional(),
    salutation: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).or(z.literal("")).optional(),
    professional_id: z.string().optional(),
    registration_id: z.string().optional(),
    identification_type: z.string().optional(),
    identification_number: z.string().optional(),
  })
  .refine((data) => !!data.email || !!data.phone, {
    message: "Provide an email address or a phone number",
    path: ["email"],
  });

export const userEditSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  full_name: z.string().optional(),
  // Blank means "leave the current password alone", so the length rule only
  // applies once something has been typed.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .or(z.literal(""))
    .optional(),
  is_active: z.boolean().optional(),
});

// ============================================================
// Patients
// ============================================================

export const patientLookupSchema = z.object({
  identificationType: z.string().min(1, "Identification type is required"),
  identificationNumber: z
    .string()
    .min(1, "Identification number is required")
    .min(4, "Identification number looks too short"),
});

// ============================================================
// DICOM
// ============================================================

/**
 * Configuring a device's connection.
 *
 * AE titles are capped at 16 characters by the DICOM standard, and the port is
 * a TCP port. Both are checked here so a typo does not cost a round trip and,
 * on the claim flow, a registration attempt against Orthanc.
 */
export const dicomConfigureSchema = z.object({
  ae_title: z
    .string()
    .min(1, "AE title is required")
    .max(16, "AE titles are at most 16 characters"),
  ip: z.string().min(1, "Device host or IP is required"),
  port: z.coerce
    .number({ invalid_type_error: "Port must be a number" })
    .int("Port must be a whole number")
    .min(1, "Port must be between 1 and 65535")
    .max(65535, "Port must be between 1 and 65535"),
});

/** The facility portal allows a longer AE title than the DICOM configure route. */
export const facilityEquipmentCreateSchema = z.object({
  ae_title: z
    .string()
    .min(1, "AE title is required")
    .max(64, "Maximum 64 characters"),
  name: z.string().optional(),
  serial_number: z.string().optional(),
});

// ============================================================
// Permissions
// ============================================================

export const permissionSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  resource: z.string().min(1, "Resource is required"),
  action: z.string().min(1, "Action is required"),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

// ============================================================
// Procedures
// ============================================================

/**
 * A procedure's shares are entered as text and posted as numbers, so they are
 * coerced here. The two shares are what the vendor and the facility each take
 * from the tariff, so they cannot exceed it.
 */
export const procedureSchema = z
  .object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    modality: z.string().optional(),
    tariff: z.coerce
      .number({ invalid_type_error: "Tariff must be a number" })
      .min(0, "Tariff cannot be negative"),
    vendor_share: z.coerce
      .number({ invalid_type_error: "Vendor share must be a number" })
      .min(0, "Vendor share cannot be negative"),
    facility_share: z.coerce
      .number({ invalid_type_error: "Facility share must be a number" })
      .min(0, "Facility share cannot be negative"),
    is_active: z.boolean().optional(),
    capitated: z.boolean().optional(),
    description: z.string().optional(),
  })
  .refine((data) => data.vendor_share + data.facility_share <= data.tariff, {
    message: "The vendor and facility shares cannot exceed the tariff",
    path: ["facility_share"],
  });

// ============================================================
// Vendor profile
// ============================================================

export const vendorProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .or(z.literal(""))
    .optional(),
  phone: z.string().optional(),
  website: z
    .string()
    .url("Enter a full URL, including https://")
    .or(z.literal(""))
    .optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

// ============================================================
// Ping requests
// ============================================================

/**
 * Approving or rejecting a ping request. A custom AE title is only required
 * when "custom" was chosen, which is a cross-field rule.
 */
export const pingDecisionSchema = z
  .object({
    approval_reason: z.string().optional(),
    ae_title_source: z.string().optional(),
    selected_ae_title: z
      .string()
      .max(16, "AE titles are at most 16 characters")
      .optional(),
  })
  .refine(
    (data) =>
      data.ae_title_source !== "custom" || !!data.selected_ae_title?.trim(),
    {
      message: "Enter the AE title to use",
      path: ["selected_ae_title"],
    },
  );

// ============================================================
// Reports
// ============================================================

/** A report range has to run forwards. */
export const reportRangeSchema = z
  .object({
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
  })
  .refine((data) => data.start_date <= data.end_date, {
    message: "The end date cannot be before the start date",
    path: ["end_date"],
  });

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type FacilityFormData = z.infer<typeof facilitySchema>;
export type VendorFormData = z.infer<typeof vendorSchema>;
export type ReportFormData = z.infer<typeof reportFormSchema>;
export type LotCreationFormData = z.infer<typeof lotCreationSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type FacilityEditFormData = z.infer<typeof facilityEditSchema>;
export type FacilityRenameFormData = z.infer<typeof facilityRenameSchema>;
export type UserCreateFormData = z.infer<typeof userCreateSchema>;
export type UserEditFormData = z.infer<typeof userEditSchema>;
export type PatientLookupFormData = z.infer<typeof patientLookupSchema>;
export type DicomConfigureFormData = z.infer<typeof dicomConfigureSchema>;
export type FacilityEquipmentCreateFormData = z.infer<
  typeof facilityEquipmentCreateSchema
>;
export type PermissionFormData = z.infer<typeof permissionSchema>;
export type ProcedureFormData = z.infer<typeof procedureSchema>;
export type VendorProfileFormData = z.infer<typeof vendorProfileSchema>;
export type PingDecisionFormData = z.infer<typeof pingDecisionSchema>;
export type ReportRangeFormData = z.infer<typeof reportRangeSchema>;
