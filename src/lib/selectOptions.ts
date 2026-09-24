/**
 * Option lists the UI owns.
 *
 * These are the enumerations the API documents but does not publish as filter
 * options. Anything the API *does* publish — equipment statuses, modalities,
 * categories, assignable roles — is read from its `available_filters` block
 * instead, so those lists cannot drift from the deployment.
 */

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export const FACILITY_TYPE_OPTIONS: SelectOption[] = [
  { value: "Dispensary", label: "Dispensary" },
  { value: "Health Center", label: "Health Center" },
  { value: "Hospital", label: "Hospital" },
  { value: "Clinic", label: "Clinic" },
  { value: "Medical Center", label: "Medical Center" },
];

export const KEPH_LEVEL_OPTIONS: SelectOption[] = [1, 2, 3, 4, 5, 6].map(
  (level) => ({ value: String(level), label: `Level ${level}` }),
);

export const FACILITY_OWNER_OPTIONS: SelectOption[] = [
  { value: "Ministry of Health", label: "Ministry of Health" },
  { value: "Private", label: "Private" },
  { value: "Faith Based", label: "Faith Based" },
  { value: "NGO", label: "NGO" },
];

export const REGULATORY_STATUS_OPTIONS: SelectOption[] = [
  { value: "Pending Registration", label: "Pending Registration" },
  { value: "Licensed", label: "Licensed" },
  { value: "Suspended", label: "Suspended" },
  { value: "Revoked", label: "Revoked" },
];

export const OPERATION_STATUS_OPTIONS: SelectOption[] = [
  { value: "Operational", label: "Operational" },
  { value: "Non-Operational", label: "Non-Operational" },
  { value: "Temporarily Closed", label: "Temporarily Closed" },
];

export const GENDER_OPTIONS: SelectOption[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const IDENTIFICATION_TYPE_OPTIONS: SelectOption[] = [
  { value: "National ID", label: "National ID" },
  { value: "Passport", label: "Passport" },
  { value: "Alien ID", label: "Alien ID" },
  { value: "Military ID", label: "Military ID" },
];

export const SALUTATION_OPTIONS: SelectOption[] = [
  "Mr.",
  "Mrs.",
  "Ms.",
  "Dr.",
  "Prof.",
  "Eng.",
].map((value) => ({ value, label: value }));

/** Yes/no filters the API reads as the literal strings. */
export const BOOLEAN_FILTER_OPTIONS: SelectOption[] = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];
