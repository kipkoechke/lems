# VEMS API Reference — v1

**Base URL:** `https://{APP_DOMAIN}/api/v1`

All requests and responses use `application/json`. Authenticated endpoints require the `Authorization: Bearer {token}` header obtained from the login endpoint.

---

## Table of Contents

- [Quick Reference: Endpoints by User Role](#quick-reference-endpoints-by-user-role)
- [1. Authentication](#1-authentication)
- [2. Patients](#2-patients)
- [3. Places](#3-places)
- [4. Professionals & Practitioners](#4-professionals--practitioners)
- [5. Facilities](#5-facilities)
- [6. Vendors & Vendor Management](#6-vendors--vendor-management)
- [7. Equipment](#7-equipment)
- [8. Equipment DICOM Integration](#8-equipment-dicom-integration)
- [9. Equipment Status Logs](#9-equipment-status-logs)
- [10. SHA Procedures](#10-sha-procedures)
- [11. Lots & Services](#11-lots--services)
- [12. Contracts](#12-contracts)
- [13. Bookings — Standard Flow (OTP)](#13-bookings--standard-flow-otp)
- [14. Bookings — Direct / Override](#14-bookings--direct--override)
- [15. Booking Actions](#15-booking-actions)
- [16. Provider Portal](#16-provider-portal)
- [17. Payer Validation](#17-payer-validation)
- [18. Medical Requests (EMR Intake)](#18-medical-requests-emr-intake)
- [19. DICOM Events & Callbacks](#19-dicom-events--callbacks)
- [20. SHA Verification & Interventions](#20-sha-verification--interventions)
- [21. Admin Dashboard & Analytics](#21-admin-dashboard--analytics)
- [22. Users & Permissions (Admin)](#22-users--permissions-admin)
- [23. Revenue Distributions (Settings)](#23-revenue-distributions-settings)
- [24. Health & System](#24-health--system)
- [25. Error Reference](#25-error-reference)
- [Appendix: Shared Object Shapes](#appendix-shared-object-shapes)

---

## Quick Reference: Endpoints by User Role

### System Admin (`admin`)

Full system access — all endpoints.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Authenticate |
| `/auth/logout` | POST | Logout |
| `/users` | GET/POST | List / Create users |
| `/users/{id}` | GET/PUT/DELETE | User CRUD |
| `/admin/dashboard` | GET | Dashboard overview |
| `/admin/equipment` | GET | Equipment listing |
| `/admin/permissions` | GET/POST | List / Create permissions |
| `/admin/permissions/{id}` | GET/PUT/DELETE | Permission CRUD |
| `/admin/users/{id}/permissions` | GET | List user permissions |
| `/admin/users/{id}/permissions/{pid}` | POST/DELETE | Assign / Unassign permission |
| `/equipment-status/*` | * | Equipment status logs |
| `/dicom/server/status` | GET | DICOM server status |
| `/dicom/modalities` | GET | List modalities |
| `/dicom/modalities/register-all` | POST | Register all modalities |
| `/dicom/equipment/{id}/configure` | POST | Configure DICOM |
| `/dicom/equipment/{id}/register` | POST/DELETE | Register / Unregister |
| `/dicom/equipment/{id}/test` | POST | Test connection |
| `/dicom/equipment/{id}/status` | GET | Equipment DICOM status |
| `/dicom/discovered` | POST | Discover equipment |
| `/dicom/orthanc/started` | POST | Sync modalities |
| `/dicom/callback/result` | POST | DICOM result callback |
| `/dicom/callback/status` | POST | DICOM status callback |
| `/procedures` | GET/POST | List / Create SHA procedures |
| `/procedures/{id}` | GET/PUT/DELETE | Procedure CRUD |
| `/procedures/modality-mappings` | GET/POST | Modality-procedure mappings |
| `/procedures/modality-mappings/{id}` | DELETE | Remove mapping |
| `/requests` | GET | List medical requests |
| `/requests/{id}` | GET | Request details |
| `/requests/{id}/cancel` | POST | Cancel request |
| `/requests/{id}/retarget` | POST | Retarget request |
| `/requests/{id}/mwl/regenerate` | POST | Regenerate MWL |
| `/requests/{id}/simulate-orthanc-result` | POST | Simulate Orthanc result |
| `/requests/stats/summary` | GET | Request stats |
| `/settings/revenue-distributions` | GET/POST | Revenue distributions |
| `/settings/revenue-distributions/{id}` | PUT | Update distribution |
| `/analytics/*` | GET | All analytics endpoints |
| `/sha/interventions` | GET | SHA interventions list |
| `/sha/callback/claim-status` | POST | SHA claim status callback |

### NESP Admin (`nesp`) / MOH Admin (`moh`) / COG Admin (`cog`)

Read-only oversight across the system.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Authenticate |
| `/auth/logout` | POST | Logout |
| `/facilities` | GET | List facilities |
| `/facilities/{id}` | GET | Get facility |
| `/facilities/fr/search` | GET | Search FR registry |
| `/equipment` | GET | List equipment |
| `/equipment/{id}` | GET | Get equipment |
| `/vendors` | GET | List vendors |
| `/vendors/{id}` | GET | Get vendor |
| `/admin/dashboard` | GET | Dashboard overview |
| `/admin/equipment` | GET | Equipment listing |
| `/analytics/*` | GET | All analytics endpoints |
| `/requests/stats/summary` | GET | Request stats |
| `/sha/interventions` | GET | SHA interventions list |

### Vendor User (`vendor`)

Manage own vendor profile, equipment, contacts, and bookings.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Authenticate |
| `/auth/logout` | POST | Logout |
| `/vendors/{vendor}` | GET/PUT | Get / Update own vendor |
| `/vendors/{vendor}/equipments` | GET/POST | List / Add equipment |
| `/vendors/{vendor}/equipments/{id}` | GET/PATCH | Get / Update equipment |
| `/vendors/{vendor}/contacts` | GET/POST | List / Add contacts |
| `/vendors/{vendor}/contacts/{id}` | PUT/DELETE | Update / Delete contact |
| `/vendors/{vendor}/bookings` | GET | View bookings for own equipment |
| `/vendors/{vendor}/dashboard` | GET | Vendor dashboard |
| `/vendors/dropdown-config` | GET/POST | Modality config |
| `/vendors/modalities` | GET/POST | Modality aliases |
| `/equipment` | GET/POST | List / Create equipment |
| `/equipment/{id}` | GET/PUT/DELETE | Equipment CRUD |
| `/equipment/{id}/capabilities` | GET | Equipment capabilities |
| `/equipment/{id}/procedures` | GET/POST/DELETE | Equipment procedures |
| `/equipment/{id}/publish-orthanc` | POST | Publish to Orthanc |
| `/equipment/ping-requests` | POST | Capture ping request |
| `/equipment/ping-requests/pending` | GET | Pending ping requests |
| `/equipment/ping-requests/realtime` | GET | Realtime ping requests |
| `/equipment/sync-dicom-aet` | POST | Sync DICOM AET |
| `/dicom/equipment/{id}/configure` | POST | Configure DICOM |
| `/dicom/equipment/{id}/test` | POST | Test DICOM connection |
| `/dicom/equipment/{id}/register` | POST/DELETE | Register / Unregister modality |
| `/dicom/equipment/{id}/status` | GET | DICOM status |

### Facility Admin (`f_admin`)

Manage facility, bookings, patients, contracts, and users.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Authenticate |
| `/auth/logout` | POST | Logout |
| `/facilities` | GET/POST | List / Create facilities |
| `/facilities/{id}` | GET/PUT | Get / Update facility |
| `/facilities/fr/search` | GET | Search FR registry |
| `/patients` | GET/POST | List / Fetch patients |
| `/patients/{id}` | GET/DELETE | Get / Delete patient |
| `/patients/{id}/bookings` | GET | Patient bookings |
| `/patients/eligibility` | POST | Check SHA eligibility |
| `/lots` | GET/POST | List / Create lots |
| `/lots/{id}` | GET/PUT/DELETE | Lot CRUD |
| `/lots/{lot}/services` | GET/POST | List / Add lot services |
| `/lots/{lot}/services/{id}` | GET/PATCH/DELETE | Service CRUD |
| `/contracts` | GET/POST | List / Create contracts |
| `/contracts/{id}` | GET/PUT/DELETE | Contract CRUD |
| `/contracts/{contract}/services` | GET/POST | List / Add contract services |
| `/contracts/{contract}/services/{id}` | PATCH/DELETE | Update / Delete contract service |
| `/contracts/facility/{facility}/discover` | GET | Discover contract services |
| `/bookings` | GET/POST | List / Create bookings |
| `/bookings/{id}` | GET | Booking details |
| `/bookings/{booking}/cancel` | POST | Cancel booking |
| `/bookings/{booking}/services` | GET | Booking services |
| `/bookings/{booking}/approve-finance` | POST | Approve finance |
| `/bookings/{booking}/services/{sid}/assign-equipment` | POST | Assign equipment |
| `/bookings/{booking}/services/{sid}/request-completion` | POST | Request completion OTP |
| `/bookings/{booking}/services/{sid}/verify-completion` | POST | Verify completion OTP |
| `/bookings/{booking}/services/{sid}/resend-completion` | POST | Resend completion OTP |
| `/bookings/{booking}/services/{sid}/complete` | POST | Complete service |
| `/bookings/initiate` | POST | Initiate OTP booking |
| `/bookings/verify-otp` | POST | Verify booking OTP |
| `/bookings/resend-otp` | POST | Resend booking OTP |
| `/bookings/session-status` | GET | Poll session status |
| `/professionals` | POST | Register professional |
| `/practitioner/worklist` | GET | Practitioner worklist |
| `/users` | GET/POST | List / Create facility users |
| `/users/{id}` | GET/PUT/DELETE | Facility user CRUD |
| `/equipment` | GET | List equipment |
| `/equipment/{id}` | GET | Get equipment |
| `/equipment/facility/{facility}/operational` | GET | Facility operational equipment |
| `/admin/dashboard` | GET | Facility dashboard |

### Finance Manager (`f_finance`)

Approve bookings, manage payments.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Authenticate |
| `/auth/logout` | POST | Logout |
| `/bookings` | GET | List bookings |
| `/bookings/{id}` | GET | Booking details |
| `/bookings/{booking}/services` | GET | Booking services |
| `/bookings/{booking}/approve-finance` | POST | Approve finance |
| `/bookings/{booking}/services/{sid}/assign-equipment` | POST | Assign equipment |
| `/patients/eligibility` | POST | Check SHA eligibility |

### Practitioner (`f_practitioner`)

Clinical operations — recommend and complete services.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Authenticate |
| `/auth/logout` | POST | Logout |
| `/patients` | GET/POST | List / Fetch patients |
| `/patients/{id}` | GET | Get patient |
| `/patients/{id}/bookings` | GET | Patient bookings |
| `/patients/eligibility` | POST | Check SHA eligibility |
| `/practitioner/worklist` | GET | Practitioner worklist |
| `/bookings` | GET/POST | List / Create bookings |
| `/bookings/{id}` | GET | Booking details |
| `/bookings/{booking}/services` | GET | Booking services |
| `/bookings/{booking}/services/{sid}/request-completion` | POST | Request completion OTP |
| `/bookings/{booking}/services/{sid}/verify-completion` | POST | Verify completion OTP |
| `/bookings/{booking}/services/{sid}/resend-completion` | POST | Resend completion OTP |
| `/bookings/{booking}/services/{sid}/complete` | POST | Complete service |
| `/bookings/initiate` | POST | Initiate OTP booking |
| `/bookings/verify-otp` | POST | Verify booking OTP |
| `/bookings/resend-otp` | POST | Resend booking OTP |
| `/bookings/session-status` | GET | Poll session status |
| `/equipment/facility/{facility}/operational` | GET | Facility operational equipment |
| `/equipment/{id}/capabilities` | GET | Equipment capabilities |
| `/equipment/{id}/procedures` | GET | Equipment procedures |

### Equipment User (`f_equipment_user`)

Equipment operation only.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Authenticate |
| `/auth/logout` | POST | Logout |
| `/bookings/{booking}/services` | GET | Booking services |
| `/bookings/{booking}/services/{sid}/request-completion` | POST | Request completion OTP |
| `/bookings/{booking}/services/{sid}/verify-completion` | POST | Verify completion OTP |
| `/bookings/{booking}/services/{sid}/resend-completion` | POST | Resend completion OTP |
| `/bookings/{booking}/services/{sid}/complete` | POST | Complete service |
| `/equipment/facility/{facility}/operational` | GET | Facility operational equipment |
| `/equipment/{id}/capabilities` | GET | Equipment capabilities |
| `/dicom/equipment/{id}/test` | POST | Test DICOM connection |
| `/dicom/equipment/{id}/status` | GET | Equipment DICOM status |

### Provider Portal (`provider_portal`)

HMIS integration — create worklist bookings from external systems.

All routes require `role:provider_portal` under the `/provider` prefix.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Authenticate (returns token only) |
| `/auth/logout` | POST | Logout |
| `/provider/facilities/services` | GET | Facility services |
| `/provider/book` | POST | Create booking worklist |
| `/provider/bookings` | GET | List bookings |
| `/provider/bookings/{visitId}` | GET | Get booking |
| `/provider/bookings/{visitId}/costs` | GET | Booking cost breakdown |
| `/provider/bookings/{visitId}/claim` | POST | Assign claim ID |
| `/provider/bookings/{visitId}/services` | POST | Add services to booking |

### Payer (`payer`)

Validate services in VEMS for claim processing.

All routes require `role:payer` under the `/payer` prefix.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Authenticate (returns token only) |
| `/auth/logout` | POST | Logout |
| `/payer/validate` | GET | Validate services for payer |

---

## 1. Authentication

### POST `/auth/login`

Authenticates a user and returns a bearer token.

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `login` | string | Yes* | Email or phone. Use either `login` or `email`. |
| `email` | string | Yes* | Alias for `login`. |
| `password` | string | Yes | |

**Response `200`** — Standard user roles

```json
{
  "user": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@hospital.co.ke",
    "phone": "+254700000000",
    "role": {
      "key": "practitioner",
      "label": "Practitioner",
      "type": "facility"
    },
    "profile": {
      "salutation": "Dr.",
      "gender": "female",
      "professional_id": "...",
      "registration_id": "...",
      "status": "active"
    },
    "entity": {
      "type": "facility",
      "id": "uuid",
      "fr_code": "14062",
      "name": "Kenyatta National Hospital",
      "keph_level": "6",
      "facility_type": "National Referral Hospital"
    },
    "permissions": {
      "create_bookings": true,
      "view_bookings": true,
      "complete_services": true
    }
  },
  "token": "1|abc123..."
}
```

**Response `200`** — System integration roles (`provider_portal`, `payer`)

```json
{
  "token": "1|abc123..."
}
```

**Response `403`** — Inactive account

```json
{ "message": "Your account is inactive. Please contact support." }
```

**Response `422`** — Invalid credentials or rate-limited

> Rate limit: 5 attempts per 5 minutes per identifier + IP.

---

### POST `/auth/logout`

**Auth required.** Invalidates the current token and session.

**Response `200`**

```json
{ "message": "Logged out successfully" }
```

---

## 2. Patients

### GET `/patients`

List patients with optional filters.

**Query Parameters**

| Param | Type | Notes |
|-------|------|-------|
| `search` | string | Searches name, ID number, phone, CR number, SHA number |
| `county_id` | uuid | |
| `sub_county_id` | uuid | |
| `ward_id` | uuid | |
| `is_dependant` | boolean | `true` = dependants only |
| `is_alive` | boolean | |
| `sort_by` | string | `name`, `date_of_birth`, `created_at` |
| `sort_order` | string | `asc`, `desc` |
| `per_page` | integer | 1–100, default 15 |

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Kamau",
      "date_of_birth": "1990-05-10",
      "age": 35,
      "gender": "male",
      "phone": "+254711000000",
      "identification_type": "National ID",
      "identification_no": "12345678",
      "cr_no": "CR/2025/00123",
      "sha_number": "SHA/0001234",
      "is_dependant": false,
      "is_alive": true,
      "county": { "id": "uuid", "name": "Nairobi" },
      "sub_county": { "id": "uuid", "name": "Westlands" },
      "principal": null
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 4,
    "per_page": 15,
    "total": 52,
    "from": 1,
    "to": 15
  }
}
```

---

### POST `/patients`

Fetch a patient from HIE by ID number and store locally. Returns `409` if patient already exists.

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `identification_type` | string | Yes | `National ID`, `Birth Certificate`, `Passport`, `SHA Number`, `CR Number` |
| `identification_number` | string | Yes | The patient's ID number |

**Response `201`** — Created

```json
{
  "message": "Patient fetched and stored successfully.",
  "patient": {
    "id": "uuid",
    "name": "John Kamau",
    "date_of_birth": "1990-05-10",
    "age": 35,
    "gender": "male",
    "phone": "+254711000000",
    "identification_type": "National ID",
    "identification_no": "12345678",
    "cr_no": "CR/2025/00123",
    "sha_number": "SHA/0001234",
    "is_dependant": false,
    "is_alive": true,
    "county": { "id": "uuid", "name": "Nairobi" },
    "sub_county": { "id": "uuid", "name": "Westlands" },
    "ward": { "id": "uuid", "name": "Parklands" },
    "relationship": null,
    "dependants": [
      {
        "id": "uuid",
        "name": "Mary Kamau",
        "relationship": "spouse",
        "date_of_birth": "1993-08-20",
        "age": 31
      }
    ],
    "created_at": "2025-05-01T10:00:00+03:00",
    "updated_at": "2025-05-01T10:00:00+03:00"
  }
}
```

**Response `409`** — Already exists (same shape as `201`)

---

### GET `/patients/{id}`

Get a single patient by UUID.

**Response `200`** — Same detailed shape as `POST /patients` response.

---

### DELETE `/patients/{id}`

Soft-delete a patient.

**Response `200`**
```json
{ "message": "Patient deleted successfully." }
```

---

### GET `/patients/{id}/bookings`

List bookings for a specific patient.

**Query Parameters**

| Param | Type | Notes |
|-------|------|-------|
| `status` | string | `pending_otp`, `active`, `completed`, `cancelled` |
| `sort_by` | string | `created_at`, `booking_number`, `status` |
| `sort_order` | string | `asc`, `desc` |
| `per_page` | integer | 1–100, default 15 |

**Response `200`** — Paginated booking list (see [Booking Object](#booking-object)).

---

### POST `/patients/eligibility`

Check a patient's SHA coverage eligibility. Fetches/stores the patient from HIE if not already in the system.

**Request Body**

| Field | Type | Required |
|-------|------|----------|
| `identificationType` | string | Yes — same values as `POST /patients` |
| `identificationNumber` | string | Yes |

**Response `200`** — Eligible

```json
{
  "eligible": true,
  "message": "Patient has active coverage",
  "checked_via": "direct",
  "patient": {
    "id": "uuid",
    "name": "John Kamau",
    "cr_no": "CR/2025/00123",
    "sha_number": "SHA/0001234"
  },
  "coverage": {
    "type": "NHIF",
    "start_date": "2024-01-01",
    "end_date": "2025-12-31",
    "member_type": "principal"
  }
}
```

**Response `200`** — Covered via principal

```json
{
  "eligible": true,
  "message": "Patient is covered under John Kamau (spouse)",
  "checked_via": "principal",
  "patient": { ... },
  "coverage": { ... },
  "principal": {
    "id": "uuid",
    "name": "John Kamau",
    "relationship": "spouse"
  }
}
```

**Response `200`** — Not eligible

```json
{
  "eligible": false,
  "message": "Patient is not eligible for coverage",
  "checked_via": "direct",
  "patient": { ... },
  "reason": "Coverage expired",
  "possible_solution": "Renew SHA membership"
}
```

---

## 3. Places

### GET `/places/counties`

Returns all counties.

**Response `200`**
```json
[{ "id": "uuid", "name": "Nairobi" }, ...]
```

---

### GET `/places/counties/{county}/sub-counties`

Returns sub-counties for a county.

---

### GET `/places/sub-counties/{subCounty}/wards`

Returns wards for a sub-county.

---

## 4. Professionals & Practitioners

### POST `/professionals`

Register a health professional. Fetches practitioner data from the HIE registry.

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `identification_type` | string | Yes | `Registration Number`, `License Number` |
| `identification_number` | string | Yes | The professional's registration/license number |
| `regulator` | string | Yes | e.g. `KMPDC`, `Nursing Council` |
| `facility_id` | uuid | Yes | Facility the professional is associated with |

**Response `201`**

```json
{
  "message": "Professional registered successfully.",
  "professional": {
    "id": "uuid",
    "name": "Dr. Alice Odhiambo",
    "salutation": "Dr.",
    "gender": "female",
    "professional_id": "R/12345",
    "registration_id": "KMPDC/2020/00123",
    "specialization": "Radiology",
    "status": "active",
    "facility": { "id": "uuid", "name": "KNH", "fr_code": "14062" }
  }
}
```

---

### GET `/practitioner/worklist`

Get the current practitioner's worklist — services assigned to them across all bookings.

**Query Parameters**

| Param | Type | Notes |
|-------|------|-------|
| `status` | string | `not_started`, `in_progress`, `completed` |
| `from` | date | `Y-m-d` |
| `to` | date | `Y-m-d` |
| `per_page` | integer | 1–100, default 15 |

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "booking_id": "uuid",
      "booking_number": "BK-2025-00042",
      "service": { "code": "XRAY-CHEST-PA", "name": "Chest X-Ray PA" },
      "patient": { "id": "uuid", "name": "John Kamau" },
      "scheduled_date": "2025-06-01",
      "status": "not_started",
      "equipment": null
    }
  ],
  "pagination": { "current_page": 1, "per_page": 15, "total": 8 }
}
```

---

## 5. Facilities

### GET `/facilities/fr/search`

Search the external FR Facility Registry by identifier and sync the result locally. Caches the FR bearer token for reuse.

**Query Parameters**

| Param | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `identifier` | string | Yes | — | FR facility identifier value (min 3 chars) |
| `identifier-type` | string | No | `fr-code` | e.g. `fr-code`, `hmis-code` |

**Response `200`**

```json
[
  {
    "registrationNumber": "017801",
    "frCode": "FID-44-106345-2",
    "officialName": "LIFECARE HOSPITAL MIGORI",
    "kephLevel": "LEVEL 4",
    "facilityOwnership": "Private"
  }
]
```

**Response `502`** — FR integration error.

---

### GET `/facilities`

List facilities with pagination and filtering.

**Query Parameters**

| Param | Type | Notes |
|-------|------|-------|
| `county` | string | County name filter |
| `hmis` | string | HMIS code filter |
| `status` | string | `active`, `inactive`, `suspended` |
| `sha_contract_status` | string | `active`, `pending`, `inactive`, `expired` |
| `search` | string | Free-text search |
| `page` | integer | Default 1 |
| `page_size` | integer | 1–100, default 20 |

**Response `200`** — Paginated facility list.

---

### POST `/facilities`

Create a new facility. **Auth required.**

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Facility identifier (FR code), max 50 chars |
| `name` | string | Yes | Official name, max 255 chars |
| `keph_level` | integer | Yes | 1–6 |
| `ownership` | string | Yes | `public`, `private`, `faith_based`, `ngo`, `parastatal`, `military` |
| `county` | string | Yes | Max 100 chars |
| `subcounty` | string | Yes | Max 100 chars |
| `ward` | string | Yes | Max 100 chars |
| `hmis` | string | Yes | HMIS code, max 100 chars |
| `callback_url` | uri | Yes | EMR callback URL |
| `username` | string | No | Facility system username |
| `password` | string | No | Facility system password |
| `status` | string | No | Default `active` |
| `sha_contract_status` | string | No | Default `pending` |

**Response `201`** — Facility created.

---

### GET `/facilities/{facility_id}`

Get a facility by ID.

**Response `200`** — Full facility object.

---

### PUT `/facilities/{facility_id}`

Update facility fields. All body fields are optional.

---

### DELETE `/facilities/{facility_id}`

Soft-delete by marking status as `inactive`. Returns `204`.

---

## 6. Vendors & Vendor Management

### GET `/vendors`

List vendors with pagination and filtering.

**Query Parameters**

| Param | Type | Notes |
|-------|------|-------|
| `lifecycle_state` | string | `active`, `disabled`, `retired` |
| `search` | string | Free-text search |
| `page` | integer | Default 1 |
| `page_size` | integer | 1–100, default 20 |

**Response `200`** — Paginated vendor list with contacts and modalities.

---

### POST `/vendors`

Create a new vendor. **Auth required.**

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `vendor_alpha_code` | string | Yes | 3–10 chars, unique |
| `dha_vendor_code` | string | Yes | DHA code, max 50 chars |
| `sha_vendor_code` | string | Yes | SHA code, max 50 chars |
| `name` | string | Yes | Max 255 chars |
| `description` | string | No | |
| `address` | string | No | |
| `country` | string | No | ISO 2-letter, default `KE` |
| `email` | string | No | |
| `phone` | string | No | Max 20 chars |
| `website` | string | No | |
| `financial_details` | object | No | |
| `lifecycle_state` | string | No | Default `active` |
| `modality_ids` | array | No | UUID array of modality references |

**Response `201`** — Vendor created.

---

### GET `/vendors/{vendor_id}`

Get vendor by ID. Includes contacts and modalities.

---

### PUT `/vendors/{vendor_id}`

Update vendor. All fields optional.

---

### DELETE `/vendors/{vendor_id}`

Soft-delete (mark as `retired`). Returns `204`.

---

### Vendor Dropdown Config

#### GET `/vendors/dropdown-config`

List dropdown config entries (modality categories and codes).

**Query Parameters**

| Param | Type | Notes |
|-------|------|-------|
| `category` | string | Filter by category |
| `status` | string | `active`, `disabled` |

#### POST `/vendors/dropdown-config`

Create a dropdown config entry.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `category` | string | Yes | 2–50 chars |
| `name` | string | Yes | 1–100 chars |
| `code` | string | Yes | 2–50 chars |
| `status` | string | No | Default `active` |

#### PUT `/vendors/dropdown-config/{dropdown_id}`

Update a dropdown config entry. All fields optional.

---

### Vendor Modalities

#### GET `/vendors/modalities`

List modality aliases (compatibility alias for legacy endpoint).

#### POST `/vendors/modalities`

Create modality alias. Same schema as dropdown config.

#### PUT `/vendors/modalities/{modality_id}`

Update modality alias.

#### GET `/vendors/{vendor_id}/modalities`

List modality associations for a vendor.

#### POST `/vendors/{vendor_id}/modalities`

Add modality associations for a vendor.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `modality_ids` | array[uuid] | Yes | Modality UUIDs to associate |

#### PUT `/vendors/{vendor_id}/modalities`

Replace vendor modality associations.

---

### Vendor Contacts

#### GET `/vendors/{vendor_id}/contacts`

List contacts for a vendor.

#### POST `/vendors/{vendor_id}/contacts`

Create a new vendor contact.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `first_name` | string | Yes | 1–100 chars |
| `last_name` | string | Yes | 1–100 chars |
| `email` | email | Yes | |
| `phone` | string | No | Max 20 chars |
| `contact_type` | string | Yes | `technical`, `support`, `finance`, `general` |
| `title` | string | No | Max 100 chars |
| `department` | string | No | Max 100 chars |
| `is_primary` | boolean | No | Default `false` |

#### PUT `/vendors/{vendor_id}/contacts/{contact_id}`

Update a vendor contact. All fields optional.

#### DELETE `/vendors/{vendor_id}/contacts/{contact_id}`

Delete a vendor contact. Returns `204`.

---

### Vendor Bookings & Dashboard

#### GET `/vendors/{vendor}/bookings`

List bookings for all equipment belonging to the vendor.

#### GET `/vendors/{vendor}/dashboard`

Get vendor-specific dashboard with equipment counts, booking stats, and revenue summaries.

---

### GET `/equipments/categories`

Returns all valid equipment category values.

**Response `200`**
```json
[
  { "value": "xray_digital", "label": "Digital X-Ray" },
  { "value": "ct_scanner", "label": "CT Scanner" },
  ...
]
```

**All category values:**

| Value | Description |
|-------|-------------|
| `xray_digital` | Digital X-Ray |
| `xray_mobile` | Mobile X-Ray |
| `xray_portable` | Portable X-Ray |
| `fluoroscopy` | Fluoroscopy |
| `c_arm` | C-Arm |
| `ultrasound_general` | General Ultrasound |
| `ultrasound_3d_4d` | 3D/4D Ultrasound |
| `ultrasound_portable` | Portable Ultrasound |
| `doppler` | Doppler |
| `mammography_digital` | Digital Mammography |
| `mammography_3d` | 3D Mammography |
| `ct_scanner` | CT Scanner |
| `ct_scanner_multi_slice` | Multi-Slice CT Scanner |
| `mri_scanner` | MRI Scanner |
| `mri_open` | Open MRI |
| `linear_accelerator` | Linear Accelerator |
| `brachytherapy` | Brachytherapy |
| `cobalt_60` | Cobalt-60 |
| `treatment_planning` | Treatment Planning |
| `simulator` | Simulator |
| `gamma_camera` | Gamma Camera |
| `spect` | SPECT |
| `pet_scanner` | PET Scanner |
| `pet_ct` | PET-CT |
| `cyclotron` | Cyclotron |
| `angiography` | Angiography |
| `cath_lab` | Cath Lab |
| `dsa` | DSA |
| `ecg` | ECG |
| `echocardiography` | Echocardiography |
| `holter_monitor` | Holter Monitor |
| `stress_test` | Stress Test |
| `pacemaker_programmer` | Pacemaker Programmer |
| `tmt` | TMT |
| `anesthesia_machine` | Anesthesia Machine |

---

### GET `/equipments/statuses`

Returns all valid equipment status values.

**Response `200`**
```json
[
  { "value": "active", "label": "Active" },
  { "value": "inactive", "label": "Inactive" },
  { "value": "maintenance", "label": "Maintenance" },
  { "value": "decommissioned", "label": "Decommissioned" },
  { "value": "pending_installation", "label": "Pending Installation" }
]
```

---

### POST `/vendors/{vendor}/equipments`

**Onboards a new piece of equipment** under a vendor. Optionally registers the device as a DICOM modality in Orthanc when imaging DICOM fields (`ae_title`, `hl7_host`, `dicom_port`) are provided.

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | Max 255 chars |
| `category` | string | Yes | See category values above |
| `serial_number` | string | No | Must be unique, max 100 chars |
| `model` | string | No | Max 100 chars |
| `brand` | string | No | Max 100 chars |
| `manufacture_date` | date | No | |
| `description` | string | No | Max 1000 chars |
| `specifications` | object | No | Free-form JSON key/value |
| `status` | string | No | Defaults to `pending_installation`. See status values above. |
| `ae_title` | string | No | DICOM AE Title — alphanumeric + underscore, max 16 chars. Auto-uppercased. |
| `hl7_host` | string | No | IP address or hostname of the physical device |
| `hl7_port` | integer | No | 1–65535 |
| `dicom_port` | integer | No | 1–65535 |

**Response `201`**

```json
{
  "message": "Equipment added successfully.",
  "equipment": {
    "id": "uuid",
    "code": "EQ-2025-00042",
    "name": "GE Discovery XR656",
    "serial_number": "GE-XR-2024-001",
    "model": "Discovery XR656",
    "brand": "GE Healthcare",
    "manufacture_date": "2022-03-15",
    "category": "xray_digital",
    "category_label": "Digital X-Ray",
    "modality": "CR",
    "worklist_category": "RAD",
    "status": "pending_installation",
    "status_label": "Pending Installation",
    "description": "High-resolution digital radiography system",
    "specifications": { "detector_size": "43x43cm", "resolution": "3.1 lp/mm" },
    "vendor_id": "uuid",
    "vendor": { "id": "uuid", "name": "Melco Kenya Ltd", "code": "VEN001" },
    "owner_type": "vendor",
    "dicom": {
      "ae_title": "GEXR001",
      "hl7_host": "192.168.1.50",
      "hl7_port": 2575,
      "dicom_port": 11112,
      "is_connected": false,
      "last_seen_at": null
    }
  },
  "orthanc_registered": true
}
```

> `orthanc_registered` is `true` if the equipment was automatically registered as a DICOM modality in Orthanc. This is only attempted for imaging categories with DICOM fields set. A value of `false` means registration failed (Orthanc may be down) but the equipment was still created.

---

### GET `/vendors/{vendor}/equipments`

List all equipment for a vendor.

**Response `200`**

```json
{
  "data": [ ...equipment objects (same shape as above, without vendor_config)... ]
}
```

---

### GET `/vendors/{vendor}/equipments/{equipment}`

Get a single piece of equipment. Includes the DICOM/MWL server configuration the physical device must use to connect.

**Response `200`**

```json
{
  "data": {
    ...equipment object...,
    "vendor_config": {
      "mwl_server_ip": "10.0.0.1",
      "mwl_server_port": 4242,
      "mwl_server_aet": "ORTHANC",
      "equipment_aet": "GEXR001",
      "connection_type": "DICOM C-FIND Worklist (MWL)"
    }
  }
}
```

> `vendor_config` contains the server-side DICOM details that the equipment vendor's technician needs to configure the physical device to receive worklists.

---

### PATCH `/vendors/{vendor}/equipments/{equipment}`

Update equipment details. All fields are optional. When `ae_title`, `hl7_host`, or `dicom_port` are updated, the modality is automatically re-registered in Orthanc.

**Request Body** — same fields as `POST`, all optional.

**Response `200`**

```json
{
  "message": "Equipment updated successfully.",
  "equipment": { ...equipment object... },
  "orthanc_registered": true
}
```

> `orthanc_registered` is only present in the response when DICOM fields were part of the update.

---

### PATCH `/vendors/{vendor}/equipments/{equipment}` — Updated Response (2026-06-09)

The equipment response now includes vendor and ownership information.

**Response `200`**

```json
{
  "message": "Equipment updated successfully.",
  "equipment": {
    "id": "uuid",
    "code": "EQ-2025-00042",
    "name": "GE Discovery XR656",
    "serial_number": "GE-XR-2024-001",
    "model": "Discovery XR656",
    "brand": "GE Healthcare",
    "manufacture_date": "2022-03-15",
    "category": "xray_digital",
    "category_label": "Digital X-Ray",
    "modality": "CR",
    "worklist_category": "RAD",
    "status": "active",
    "status_label": "Active",
    "description": null,
    "specifications": { "detector_size": "43x43cm" },
    "vendor_id": "uuid",
    "vendor": {
      "id": "uuid",
      "name": "Melco Kenya Ltd",
      "code": "VEN001"
    },
    "owner_type": "vendor",
    "dicom": {
      "ae_title": "GEXR001",
      "hl7_host": "192.168.1.50",
      "hl7_port": 11112,
      "dicom_port": 11112,
      "is_connected": true,
      "last_seen_at": "2026-06-09T10:30:00+03:00"
    }
  },
  "orthanc_registered": true
}
```

> **New fields (2026-06-09):** `vendor_id`, `vendor` (id/name/code), and `owner_type` (`"vendor"` or `"facility"`). Eager-loaded on show, update, store, and list endpoints.

---

### POST `/dicom/equipment/{equipment}/configure`

Set or update DICOM connection details (AE title, IP, port) and register with Orthanc in one step. Also supports assigning a vendor during configuration.

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `ae_title` | string | Yes | DICOM AE title, max 16 chars, auto-uppercased |
| `ip` | string | Yes | IP address or hostname of the physical device |
| `port` | integer | Yes | DICOM port, 1–65535 |
| `vendor_id` | string | No | UUID of the vendor to assign |

**Response `200`**

```json
{
  "message": "Equipment DICOM details saved and registered with Orthanc.",
  "equipment_id": "uuid",
  "ae_title": "GEXR001",
  "ip": "192.168.1.50",
  "port": 11112,
  "registered": true
}
```

> `registered` is `true` when Orthanc modality registration succeeded. A `207` with `registered: false` means the details were saved but Orthanc registration failed.

---

### POST `/dicom/discovered`

> **Internal endpoint** — called automatically by Orthanc's `on-cfind-discovery.lua` when an unrecognized device sends a C-FIND or MWL request.

Auto-discovers a DICOM device. Creates a new equipment record under the **Uncategorized Equipments** vendor (code `UNCAT`). The admin must later assign the equipment to the correct vendor and configure ports.

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `ae_title` | string | Yes | DICOM AE Title, max 16 chars |
| `remote_ip` | string | No | IP address of the connecting device |
| `remote_port` | integer | No | Port the device uses to communicate (1–65535) |

**Response `201`** — First discovery

```json
{
  "discovered": true,
  "equipment": {
    "id": "uuid",
    "name": "Discovered: SCANNER01",
    "ae_title": "SCANNER01",
    "hl7_host": "192.168.1.100",
    "dicom_port": 11112,
    "hl7_port": 11112,
    "status": "pending_installation",
    "specifications": {
      "discovered_ip": "192.168.1.100",
      "discovered_port": 11112
    },
    "vendor": {
      "id": "uuid",
      "name": "Uncategorized Equipments",
      "code": "UNCAT"
    }
  }
}
```

**Response `200`** — Subsequent connections (device already known by AE title)

```json
{
  "discovered": false,
  "equipment": { "...existing equipment object..." }
}
```

> When a known device reconnects, only `hl7_host` and `last_seen_at` are updated — admin-set values (vendor, ports, etc.) are **never** overwritten.

---

## 7. Equipment

Standalone equipment endpoints (alternative to vendor-nested routes).

### GET `/equipment`

List equipment with pagination and filtering.

**Query Parameters**

| Param | Type | Notes |
|-------|------|-------|
| `facility_id` | string | Filter by facility |
| `facility_name` | string | Filter by facility name |
| `lifecycle_state` | string | `active`, `inactive`, `maintenance`, `disabled`, `retired` |
| `operational_status` | string | `operational`, `non_operational`, `maintenance`, `unknown` |
| `search` | string | Free-text search |
| `page` | integer | Default 1 |
| `page_size` | integer | 1–100, default 20 |

**Response `200`** — Paginated equipment list.

---

### POST `/equipment`

Create new equipment. **Auth required.**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `vendor_id` | uuid | Yes | Owning vendor |
| `name` | string | Yes | Max 255 chars |
| `category` | string | Yes | Equipment category value |
| `facility_id` | string | Yes | Facility identifier |
| `asset_id` | string | No | Unique asset tag |
| `serial_number` | string | No | Max 100 chars |
| `manufacturer` | string | No | Max 255 chars |
| `model` | string | No | Max 100 chars |
| `model_version` | string | No | Max 50 chars |
| `software_version` | string | No | Max 50 chars |
| `department` | string | No | Max 100 chars |
| `location` | string | No | Max 255 chars |
| `country_of_origin` | string | No | ISO 2-letter, default `KE` |
| `worklist_ingestion_method` | string | No | `dicom_mwl`, `hl7_mwl`, `custom_api`, `file_transfer` |
| `transmission_method` | string | No | `dicom_mpps`, `dicom_c_store`, `hl7_orm`, `rest_api`, `fhir_api` |
| `dicom_aet` | string | No | DICOM AE Title, max 16 chars |
| `dicom_host` | string | No | IP/hostname |
| `dicom_port` | integer | No | 1–65535 |
| `lifecycle_state` | string | No | Default `active` |
| `operational_status` | string | No | Default `operational` |
| `last_maintenance` | datetime | No | |
| `next_maintenance` | datetime | No | |
| `maintenance_notes` | string | No | |

**Response `201`** — Equipment created.

---

### GET `/equipment/{equipment_id}`

Get equipment by ID. Includes procedure mappings.

---

### PUT `/equipment/{equipment_id}`

Update equipment. All fields optional.

---

### DELETE `/equipment/{equipment_id}`

Soft-delete (mark as `retired`). Returns `204`.

---

### GET `/equipment/{equipment_id}/capabilities`

Get equipment capabilities and supported procedures resolved via modality.

**Response `200`**

```json
{
  "equipment_id": "uuid",
  "asset_id": "XRAY-001",
  "name": "GE Discovery XR656",
  "facility_id": "14062",
  "capable_procedures": ["XRAY-CHEST-PA", "XRAY-ABDOMEN"],
  "operational_status": "operational"
}
```

---

### GET `/equipment/{equipment_id}/procedures`

List procedures for equipment, resolved via modality mapping.

---

### POST `/equipment/{equipment_id}/procedures`

Map a procedure to equipment. (Deprecated — use modality mappings instead.)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `procedure_id` | uuid | Yes | |
| `sha_procedure_code` | string | Yes | Max 50 chars |
| `equipment_specific_code` | string | No | Max 100 chars |
| `is_capable` | boolean | No | Default `true` |
| `processing_time_minutes` | integer | No | |

---

### DELETE `/equipment/{equipment_id}/procedures/{procedure_id}`

Remove a direct equipment-procedure mapping. Returns `204`.

---

### GET `/equipment/facility/{facility_id}/operational`

Get all operational equipment at a facility.

**Response `200`** — Array of equipment capability objects.

---

### POST `/equipment/{equipment_id}/publish-orthanc`

Republish a single equipment modality entry to Orthanc.

**Response `200`** — Publication result.

---

### POST `/equipment/sync-dicom-aet`

Populate missing `dicom_aet` from `asset_id` when possible and normalize identifier casing.

---

### Equipment Ping Requests

#### POST `/equipment/ping-requests`

Capture a machine ping/storage/test-connection event for approval review.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `ae_title` | string | Yes | DICOM AE title, 1–64 chars |
| `ip_addr` | string | Yes | IP address, 1–64 chars |
| `port` | integer | Yes | 1–65535 |
| `request_type` | string | No | Default `ping` |
| `modality` | string | No | Max 32 chars |
| `device_name_ae_title` | string | No | Max 16 chars |
| `machine_features` | object | No | |
| `payload` | object | No | |
| `equipment_id` | uuid | No | Link to known equipment |

**Response `201`** — Ping request captured.

#### GET `/equipment/ping-requests/pending`

List pending ping requests waiting for approval.

#### GET `/equipment/ping-requests/realtime`

Realtime polling endpoint for the approval queue.

| Param | Type | Notes |
|-------|------|-------|
| `since` | datetime | Return requests seen since this timestamp |

#### GET `/equipment/ping-requests/linked-equipment-ids`

Return distinct equipment IDs already referenced by any ping request.

#### POST `/equipment/ping-requests/{ping_request_id}/approve`

Approve a pending machine ping request.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `approval_reason` | string | No | |
| `equipment_id` | uuid | No | Link to equipment |
| `ae_title_source` | string | No | `machine_ping`, `system_generated`, `custom` |
| `selected_ae_title` | string | No | Custom AE title |

#### POST `/equipment/ping-requests/{ping_request_id}/reject`

Reject a pending machine ping request. Same body as approve.

---

## 8. Equipment DICOM Integration

### GET `/dicom/server/status`

Get the Orthanc DICOM server status and connectivity.

**Response `200`**

```json
{
  "connected": true,
  "orthanc_version": "24.12.2",
  "ae_title": "ORTHANC",
  "host": "orthanc",
  "port": 4242,
  "registered_modalities": 15
}
```

---

### GET `/dicom/modalities`

List all registered DICOM modalities in Orthanc.

---

### POST `/dicom/modalities/register-all`

Bulk-register all equipment with DICOM config as Orthanc modalities.

---

### POST `/dicom/equipment/{equipment}/configure`

Set or update DICOM connection details (AE title, IP, port) and register with Orthanc in one step. Also supports assigning a vendor during configuration.

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `ae_title` | string | Yes | DICOM AE title, max 16 chars, auto-uppercased |
| `ip` | string | Yes | IP address or hostname of the physical device |
| `port` | integer | Yes | DICOM port, 1–65535 |
| `vendor_id` | string | No | UUID of the vendor to assign |

**Response `200`**

```json
{
  "message": "Equipment DICOM details saved and registered with Orthanc.",
  "equipment_id": "uuid",
  "ae_title": "GEXR001",
  "ip": "192.168.1.50",
  "port": 11112,
  "registered": true
}
```

> `registered` is `true` when Orthanc modality registration succeeded. A `207` with `registered: false` means the details were saved but Orthanc registration failed.

---

### POST `/dicom/equipment/{equipment}/test`

Test the DICOM echo (C-ECHO) connection to an equipment modality.

---

### POST `/dicom/equipment/{equipment}/register`

Register equipment as a DICOM modality in Orthanc.

---

### DELETE `/dicom/equipment/{equipment}/register`

Unregister equipment from Orthanc modalities.

---

### GET `/dicom/equipment/{equipment}/status`

Get equipment DICOM connectivity status (last seen, connected state).

---

### POST `/dicom/discovered`

> **Internal endpoint** — called automatically by Orthanc's `on-cfind-discovery.lua` when an unrecognized device sends a C-FIND or MWL request.

Auto-discovers a DICOM device. Creates a new equipment record under the **Uncategorized Equipments** vendor (code `UNCAT`).

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `ae_title` | string | Yes | DICOM AE Title, max 16 chars |
| `remote_ip` | string | No | IP address of the connecting device |
| `remote_port` | integer | No | Port the device uses to communicate (1–65535) |

**Response `201`** — First discovery

```json
{
  "discovered": true,
  "equipment": {
    "id": "uuid",
    "name": "Discovered: SCANNER01",
    "ae_title": "SCANNER01",
    "hl7_host": "192.168.1.100",
    "dicom_port": 11112,
    "status": "pending_installation",
    "vendor": { "id": "uuid", "name": "Uncategorized Equipments", "code": "UNCAT" }
  }
}
```

**Response `200`** — Subsequent connections (device already known by AE title)

---

### POST `/dicom/orthanc/started`

> **Internal endpoint** — called by Orthanc's `on-start.lua` to re-sync modalities after Orthanc restart.

---

### DICOM Callbacks (Internal)

#### POST `/dicom/callback/result`

Called by Orthanc Lua/Python plugin when a DICOM C-STORE result is received.

#### POST `/dicom/callback/status`

Called by Orthanc when a DICOM status update occurs (MPPS).

---

## 9. Equipment Status Logs

### GET `/equipment-status`

List equipment status change logs.

**Query Parameters**

| Param | Type | Notes |
|-------|------|-------|
| `equipment_id` | uuid | Filter by equipment |
| `status` | string | Filter by status value |
| `from` | date | `Y-m-d` |
| `to` | date | `Y-m-d` |
| `per_page` | integer | 1–100, default 15 |

---

### POST `/equipment-status`

Log an equipment status change.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `equipment_id` | uuid | Yes | |
| `status` | string | Yes | New status value |
| `notes` | string | No | Reason for status change |

---

### GET `/equipment-status/{id}`

Get a single status log entry.

---

### GET `/equipment-status/active-downtimes`

List equipment currently in downtime (maintenance/non-operational).

---

### GET `/equipment-status/summary`

Get status summary across all equipment.

**Response `200`**

```json
{
  "total_equipment": 42,
  "operational": 35,
  "maintenance": 4,
  "non_operational": 2,
  "unknown": 1,
  "total_downtime_hours": 156.5,
  "average_mtbf_hours": 720
}
```

---

### GET `/equipment-status/equipment/{equipment}/stats`

Get status statistics for a specific equipment over time.

---

## 10. SHA Procedures

### GET `/procedures`

List SHA procedures with filtering.

**Query Parameters**

| Param | Type | Notes |
|-------|------|-------|
| `lifecycle_state` | string | `active`, `suspended`, `retired` |
| `category` | string | Procedure category |
| `search` | string | Free-text search |
| `page` | integer | Default 1 |
| `page_size` | integer | 1–500, default 20 |
| `skip` | integer | Offset (alternative to page) |
| `limit` | integer | 1–500 |

**Response `200`** — Array of procedure objects.

---

### POST `/procedures`

Create a new SHA procedure.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `procedure_code` | string | Yes | 1–50 chars, unique |
| `name` | string | Yes | 1–255 chars |
| `category` | string | No | Max 100 chars |
| `procedure_type` | string | No | Max 100 chars |
| `description` | string | No | |
| `reimbursement_amount` | number | Yes | Minimum 0 |
| `currency` | string | No | Default `KES` |
| `effective_from` | datetime | Yes | |
| `effective_to` | datetime | No | |
| `lifecycle_state` | string | No | Default `active` |

**Response `201`** — Procedure created.

---

### GET `/procedures/active/list`

List only active procedures (returns simple list for frontend dropdowns).

| Param | Type | Notes |
|-------|------|-------|
| `skip` | integer | Default 0 |
| `limit` | integer | 1–500, default 100 |

---

### GET `/procedures/code/{procedure_code}`

Get procedure by procedure code.

---

### GET `/procedures/{procedure_id}`

Get procedure by ID.

---

### PUT `/procedures/{procedure_id}`

Update a procedure. All fields optional.

---

### DELETE `/procedures/{procedure_id}`

Soft-delete (mark as `retired`). Returns `204`.

---

### Modality-Procedure Mappings

#### GET `/procedures/modality-mappings`

List all modality-procedure mappings, optionally filtered by modality.

| Param | Type | Notes |
|-------|------|-------|
| `modality_code` | string | e.g. `CT`, `MRI` |
| `modality_id` | uuid | |

#### POST `/procedures/modality-mappings`

Map a procedure to a modality.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `modality_id` | uuid | Yes | |
| `procedure_id` | uuid | Yes | |
| `sha_procedure_code` | string | Yes | Max 50 chars |
| `is_capable` | boolean | No | Default `true` |
| `processing_time_minutes` | integer | No | |
| `notes` | string | No | |

#### DELETE `/procedures/modality-mappings/{mapping_id}`

Remove a procedure mapping from a modality. Returns `204`.

---

## 11. Lots & Services

### GET `/lots`

List equipment/contract lots.

---

### POST `/lots`

Create a new lot.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | |
| `number` | string | Yes | Unique lot number |
| `facility_id` | uuid | Yes | |
| `vendor_id` | uuid | No | |
| `description` | string | No | |

---

### GET `/lots/{lot}`

Get lot details with nested services.

---

### PUT `/lots/{lot}`

Update lot details.

---

### DELETE `/lots/{lot}`

Delete a lot (must have no active services).

---

### Lot Services

#### GET `/lots/{lot}/services`

List services defined under a lot.

#### POST `/lots/{lot}/services`

Add a service to a lot.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `code` | string | Yes | Service/procedure code |
| `name` | string | Yes | |
| `tariff` | number | Yes | |
| `modality` | string | No | DICOM modality code |
| `category` | string | No | |

#### GET `/lots/{lot}/services/{service}`

Get a single lot service.

#### PATCH `/lots/{lot}/services/{service}`

Update lot service. All fields optional.

#### DELETE `/lots/{lot}/services/{service}`

Remove service from lot.

---

## 12. Contracts

**Auth required** for all contract endpoints.

### GET `/contracts`

List contracts with pagination.

---

### POST `/contracts`

Create a new contract between a vendor and facility.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `vendor_id` | uuid | Yes | |
| `facility_id` | uuid | Yes | |
| `contract_number` | string | Yes | Unique |
| `start_date` | date | Yes | |
| `end_date` | date | No | |
| `status` | string | No | `active`, `inactive`, `expired` |
| `terms` | string | No | |

---

### GET `/contracts/{contract}`

Get contract details with services.

---

### PUT `/contracts/{contract}`

Update contract.

---

### DELETE `/contracts/{contract}`

Delete contract.

---

### GET `/contracts/facility/{facility}/discover`

Discover services available to a facility through its active contracts.

---

### Contract Services

#### GET `/contracts/{contract}/services`

List services under a contract.

#### POST `/contracts/{contract}/services`

Add a service to a contract.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `lot_service_id` | uuid | Yes | Reference to a lot service |
| `tariff` | number | Yes | Contract-specific tariff |
| `vendor_share_percentage` | number | No | 0–100 |
| `facility_share_percentage` | number | No | 0–100 |

#### PATCH `/contracts/{contract}/services/{service}`

Update contract service. All fields optional.

#### DELETE `/contracts/{contract}/services/{service}`

Remove service from contract.

---

## 13. Bookings — Standard Flow (OTP)

This is the recommended flow for standalone bookings. It requires patient consent via OTP before the booking is confirmed.

```
POST /bookings/initiate       → get session_id, OTP sent to patient
POST /bookings/verify-otp     → verify OTP, booking created (status: active)
POST /bookings/resend-otp     → resend if OTP not received
GET  /bookings/session-status → poll session state
```

---

### POST `/bookings/initiate`

Validates services, sends an OTP to the patient's phone, and returns a session token. The booking is **not yet created** at this point.

**Request Body**

```json
{
  "facility_id": "uuid",
  "patient_id": "uuid",
  "override": false,
  "notes": "Routine check-up",
  "services": [
    {
      "contract_service_id": "uuid",
      "practitioner_id": "uuid",
      "scheduled_date": "2025-06-01 09:00",
      "notes": "Morning slot preferred"
    }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `facility_id` | uuid | Yes | |
| `patient_id` | uuid | Yes | |
| `override` | boolean | No | Skip finance approval |
| `notes` | string | No | Max 2000 chars |
| `services` | array | Yes | Min 1 item |
| `services.*.contract_service_id` | uuid | Yes | Must belong to this facility's active contract |
| `services.*.practitioner_id` | uuid | No | |
| `services.*.scheduled_date` | string | Yes | Format `Y-m-d H:i`, must be today or future |
| `services.*.notes` | string | No | Max 500 chars |

**Response `200`**

```json
{
  "message": "OTP sent to +254711***000",
  "data": {
    "session_id": "sess_abc123xyz",
    "phone": "+254711***000",
    "expires_at": "2025-05-12T10:15:00+03:00",
    "is_override": false,
    "otp_recipient": {
      "type": "patient",
      "name": "John Kamau"
    },
    "patient": { "id": "uuid", "name": "John Kamau" },
    "facility": { "id": "uuid", "name": "Kenyatta National Hospital" },
    "services_count": 2
  }
}
```

**Response `400`** — Invalid services (fatal)

```json
{
  "message": "Invalid services in booking request.",
  "error_code": "INVALID_SERVICES",
  "errors": [
    {
      "index": 0,
      "contract_service_id": "uuid",
      "message": "Service contract is not active.",
      "error_code": "CONTRACT_INACTIVE"
    }
  ]
}
```

---

### POST `/bookings/verify-otp`

Verifies the OTP code and creates the booking. Session is consumed after one successful use.

**Request Body**

```json
{
  "session_id": "sess_abc123xyz",
  "otp": "123456"
}
```

**Response `201`**

```json
{
  "message": "Booking created successfully. OTP verified.",
  "data": { ... }
}
```

> See [Booking Detail Object](#booking-detail-object) for the `data` shape.

**Response `400`** — Wrong OTP

```json
{
  "message": "Invalid OTP code.",
  "error_code": "INVALID_OTP",
  "can_resend": true,
  "attempts_remaining": 2
}
```

**Response `410`** — Session expired or max attempts exceeded

```json
{
  "message": "OTP session has expired.",
  "error_code": "SESSION_EXPIRED",
  "can_resend": false,
  "attempts_remaining": 0
}
```

---

### POST `/bookings/resend-otp`

Resends the OTP for an active session.

**Request Body**

```json
{ "session_id": "sess_abc123xyz" }
```

**Response `200`**

```json
{
  "message": "OTP resent successfully.",
  "data": {
    "session_id": "sess_abc123xyz",
    "phone": "+254711***000",
    "expires_at": "2025-05-12T10:20:00+03:00",
    "resends_remaining": 2,
    "is_override": false,
    "recipient_type": "patient"
  }
}
```

**Response `429`** — Too many resend attempts

```json
{
  "message": "Maximum resend attempts exceeded.",
  "error_code": "MAX_RESENDS_EXCEEDED"
}
```

---

### GET `/bookings/session-status`

Poll the state of a booking session.

**Query Parameters**

| Param | Type | Required |
|-------|------|----------|
| `session_id` | string | Yes |

**Response `200`**

```json
{
  "data": {
    "exists": true,
    "status": "pending",
    "expires_at": "2025-05-12T10:20:00+03:00"
  }
}
```

**Response `404`** — Session not found or already consumed

```json
{
  "message": "Session not found or already consumed.",
  "error_code": "SESSION_NOT_FOUND"
}
```

---

## 14. Bookings — Direct / Override

### GET `/bookings`

List bookings. Returns a summary alongside paginated results.

**Query Parameters**

| Param | Type | Notes |
|-------|------|-------|
| `fr_code` | string | Filter by facility FR code |
| `facility_id` | uuid | |
| `patient_id` | uuid | |
| `status` | string | `pending_otp`, `active`, `completed`, `cancelled` |
| `source` | string | `provider_portal`, `hmis`, `standalone` |
| `from` | date | `Y-m-d` |
| `to` | date | `Y-m-d` |
| `search` | string | Booking number, patient name, ID number |
| `sort_by` | string | `booking_number`, `status`, `created_at` |
| `sort_order` | string | `asc`, `desc` |
| `per_page` | integer | 1–100, default 15 |
| `finance_approved` | boolean | |

**Response `200`**

```json
{
  "data": [ ...booking objects... ],
  "summary": {
    "total_bookings": 120,
    "unique_patients": 95,
    "by_status": {
      "pending_otp": 5,
      "active": 30,
      "completed": 80,
      "cancelled": 5
    },
    "by_source": {
      "standalone": 60,
      "hmis": 40,
      "provider_portal": 20
    },
    "revenue": {
      "tariff": "150000.00",
      "sha": "100000.00",
      "cash": "30000.00",
      "other_insurance": "20000.00"
    }
  },
  "pagination": {
    "current_page": 1,
    "last_page": 8,
    "per_page": 15,
    "total": 120,
    "from": 1,
    "to": 15
  }
}
```

---

### POST `/bookings`

Create a booking directly without the OTP pre-verification flow.

- `override: true` → booking status is immediately `active`
- `override: false` (default) → booking status is `pending_otp`, requires finance approval

**Request Body** — same shape as `POST /bookings/initiate`.

**Response `201`**

```json
{
  "message": "Booking created successfully. Sent to finance for clearance.",
  "data": { ... }
}
```

> When `override: true`: `"Booking created successfully. Services are ready to start."`

---

### GET `/bookings/{id}`

Get a single booking with full service details.

**Response `200`**

```json
{
  "data": { ... }
}
```

> See [Booking Detail Object](#booking-detail-object).

---

## 15. Booking Actions

### POST `/bookings/{booking}/cancel`

Cancel a booking and all its services. Cannot cancel a completed booking.

**Request Body**

```json
{ "reason": "Patient could not attend" }
```

**Response `200`**
```json
{ "message": "Booking cancelled successfully." }
```

---

### GET `/bookings/{booking}/services`

List all booked services for a booking.

**Query Parameters**

| Param | Notes |
|-------|-------|
| `status` | Filter by service status |

**Response `200`**

```json
{
  "data": [ ...booked service objects... ]
}
```

> See [Booked Service Object](#booked-service-object).

---

### POST `/bookings/{booking}/approve-finance`

Set the payment breakdown (SHA / cash / other insurance) for each service in the booking. The sum of the three must equal the service tariff.

**Auth required.** Finance role.

**Request Body**

```json
{
  "services": [
    {
      "booked_service_id": "uuid",
      "sha": 3000.00,
      "cash": 500.00,
      "other_insurance": 0.00
    }
  ]
}
```

> All services in the booking must be included. `sha + cash + other_insurance` must equal the service `tariff`.

**Response `200`**

```json
{
  "message": "Finance approved. Payment breakdown saved. Services are now available for equipment assignment.",
  "data": { ... }
}
```

**Response `400`** — Amount mismatch example

```json
{
  "message": "Failed to update payment breakdown for all services.",
  "errors": [
    {
      "index": 0,
      "booked_service_id": "uuid",
      "message": "Payment breakdown (3200) does not match service tariff (3500).",
      "error_code": "AMOUNT_MISMATCH",
      "tariff": 3500,
      "provided_total": 3200
    }
  ]
}
```

---

### POST `/bookings/{booking}/services/{service}/assign-equipment`

Assign a specific equipment to a service and mark it as started. Service must be in `not_started` status.

**Request Body**

```json
{ "equipment_id": "uuid" }
```

**Response `200`**

```json
{
  "message": "Equipment assigned. Service started.",
  "data": { ...booked service object... }
}
```

---

### Service Completion Flow (OTP)

Services must be completed using an OTP sent to the patient:

```
POST /bookings/{booking}/services/{service}/request-completion  → send OTP, get session_id
POST /bookings/{booking}/services/{service}/verify-completion   → verify OTP, service completed
POST /bookings/{booking}/services/{service}/resend-completion   → resend OTP
```

#### POST `.../request-completion`

No request body. Sends an OTP to the patient.

**Response `200`**

```json
{
  "message": "OTP sent to patient for service completion.",
  "data": {
    "session_id": "svc_sess_xyz789",
    "service_id": "uuid",
    "booking_id": "uuid",
    "expires_at": "2025-05-12T11:00:00+03:00",
    "expires_in_minutes": 10,
    "phone_masked": "+254711***000"
  }
}
```

#### POST `.../verify-completion`

**Request Body**

```json
{
  "session_id": "svc_sess_xyz789",
  "otp": "654321"
}
```

> `otp` must be exactly 6 characters.

**Response `200`**

```json
{
  "message": "Service completed successfully.",
  "data": {
    "service": { ...booked service object... },
    "booking_status": "completed",
    "booking_completed": true
  }
}
```

> `booking_completed` is `true` when **all** services in the booking are complete.

#### POST `.../resend-completion`

**Request Body**

```json
{ "session_id": "svc_sess_xyz789" }
```

**Response `200`**

```json
{
  "message": "OTP resent successfully.",
  "data": {
    "session_id": "svc_sess_xyz789",
    "service_id": "uuid",
    "booking_id": "uuid",
    "expires_at": "2025-05-12T11:05:00+03:00",
    "expires_in_minutes": 10,
    "resends_remaining": 1,
    "phone_masked": "+254711***000"
  }
}
```

---

### POST `/bookings/{booking}/services/{service}/complete`

Complete a service without OTP verification (legacy — used by Provider Portal integration).

**Response `200`**

```json
{
  "message": "Service completed.",
  "data": {
    "service": { ...booked service object... },
    "booking_status": "active",
    "booking_completed": false
  }
}
```

---

## 16. Provider Portal

All routes require `auth:sanctum` + `role:provider_portal`.

**Base prefix:** `/provider`

---

### GET `/provider/facilities/services`

Get services available at a facility.

---

### POST `/provider/book`

Create a booking worklist from the provider portal (HMIS integration). The `visit_id` is the HMIS visit identifier and must be unique.

**Request Body**

```json
{
  "visit_id": "uuid",
  "fr_code": "14062",
  "patient": {
    "identificationNo": "12345678",
    "identificationType": "National ID"
  },
  "services": [
    {
      "code": "XRAY-CHEST-PA",
      "scheduled_date": "2025-06-01",
      "amount": 3500.00,
      "equipment_code": "XRAY-001",
      "practitioner": {
        "identificationType": "Registration Number",
        "identificationNo": "R/12345",
        "regulator": "KMPDC"
      }
    }
  ]
}
```

| Field | Notes |
|-------|-------|
| `visit_id` | UUID, must be unique across all bookings |
| `fr_code` | Facility Registry code |
| `patient.identificationType` | `National ID`, `Temporary ID`, `Alien ID`, `Refugee ID`, `Mandate Number`, `Birth Certificate`, `Birth Notification`, `CR ID` |
| `services.*.practitioner` | Optional; all three sub-fields required if provided |

**Response `201`**

```json
{
  "message": "Booking worklist created.",
  "data": {
    "id": "uuid",
    "booking_number": "BK-2025-00042",
    "visit_id": "uuid",
    "patient": { "id": "uuid", "name": "John Kamau", "identification_no": "12345678" },
    "facility": { "name": "Kenyatta National Hospital", "fr_code": "14062" },
    "status": "active",
    "services": [ ... ],
    "created_at": "2025-05-12T09:30:00+03:00"
  }
}
```

---

### GET `/provider/bookings`

List bookings created via the provider portal.

---

### GET `/provider/bookings/{booking}`

Get a single provider portal booking.

---

### GET `/provider/bookings/{booking}/costs`

Get cost breakdown for all services in a booking.

**Response `200`**

```json
{
  "data": {
    "booking": {
      "id": "uuid",
      "booking_number": "BK-2025-00042",
      "visit_id": "uuid",
      "claim_id": "uuid"
    },
    "patient": { "name": "John Kamau", "cr_no": "CR/2025/00123" },
    "facility": { "name": "KNH", "fr_code": "14062" },
    "services": [
      {
        "id": "uuid",
        "code": "XRAY-CHEST-PA",
        "name": "Chest X-Ray PA",
        "lot": { "number": "LOT-01", "name": "Radiology Lot 1" },
        "equipment": { "code": "XRAY-001", "name": "GE Discovery XR656" },
        "practitioner": { "id": "uuid", "name": "Dr. Alice Odhiambo" },
        "scheduled_date": "2025-06-01",
        "shareDistribution": {
          "tariff": 3500.00,
          "vendorPercentage": 60,
          "facilityPercentage": 40
        },
        "payment": {
          "cash": 500.00,
          "sha": 3000.00
        },
        "breakdown": {
          "cash": { "vendor": 300.00, "facility": 200.00 },
          "sha": { "vendor": 1800.00, "facility": 1200.00 }
        },
        "status": "not_started"
      }
    ]
  }
}
```

---

### POST `/provider/bookings/{visitId}/claim`

Assign a SHA claim ID to an existing booking.

**Request Body**

```json
{ "claim_id": "uuid" }
```

**Response `200`**

```json
{
  "message": "Claim ID assigned to booking.",
  "data": {
    "id": "uuid",
    "booking_number": "BK-2025-00042",
    "visit_id": "uuid",
    "claim_id": "uuid"
  }
}
```

---

### POST `/provider/bookings/{visitId}/services`

Add additional services to an existing booking by `visit_id`.

**Request Body** — same `services` array shape as `POST /provider/book`.

**Response `200`**

```json
{
  "message": "Services added to booking.",
  "data": {
    "booking_id": "uuid",
    "booking_number": "BK-2025-00042",
    "visit_id": "uuid",
    "services": [ ... ]
  }
}
```

---

## 17. Payer Validation

### GET `/payer/validate`

Validate services for a payer using a booking reference or claim ID. Returns full service details for verification.

**Query Parameters**

| Param | Type | Required | Values |
|-------|------|----------|--------|
| `reference_type` | string | Yes | `booking_reference`, `claim_id` |
| `reference_number` | string | Yes | The booking number or claim UUID |

**Response `200`** — Found

```json
{
  "message": "Services retrieved successfully.",
  "booking": {
    "booking_number": "BK-2025-00042",
    "claim_id": "uuid",
    "source": "provider_portal",
    "status": "completed",
    "created_at": "2025-05-01T09:00:00+03:00",
    "completed_at": "2025-05-01T11:30:00+03:00"
  },
  "patient": {
    "cr_no": "CR/2025/00123",
    "name": "John Kamau",
    "identification_type": "National ID",
    "identification_no": "12345678",
    "date_of_birth": "1990-05-10",
    "phone": "+254711000000"
  },
  "facility": {
    "fr_code": "14062",
    "name": "Kenyatta National Hospital",
    "level": "6",
    "type": "National Referral Hospital",
    "ownership": "Public",
    "sha_contract_status": "active",
    "county": "Nairobi",
    "is_active": true
  },
  "financial_summary": {
    "total_tariff": 7000.00,
    "total_sha": 6000.00,
    "total_cash": 1000.00,
    "other_insurance": 0.00,
    "eligibility_verified": true,
    "finance_approved_at": "2025-05-01T09:15:00+03:00"
  },
  "services": [
    {
      "id": "uuid",
      "service": {
        "code": "XRAY-CHEST-PA",
        "name": "Chest X-Ray PA",
        "lot": { "number": "LOT-01", "name": "Radiology Lot 1" },
        "scheduled_date": "2025-06-01",
        "status": "completed",
        "completed_at": "2025-05-01T11:30:00+03:00"
      },
      "equipment": {
        "id": "uuid",
        "name": "GE Discovery XR656",
        "serial_number": "GE-XR-2024-001",
        "status": "active",
        "category": "imaging"
      },
      "vendor": {
        "id": "uuid",
        "code": "VND-001",
        "name": "MediTech Solutions Ltd",
        "contract_number": "VEMS/2025/001"
      },
      "cost": {
        "tariff": 3500.00,
        "sha": 3000.00,
        "cash": 500.00,
        "vendor_share": 2100.00,
        "facility_share": 1400.00
      }
    }
  ]
}
```

**Response `200`** — Not found (returns `200`, not `404`)

```json
{
  "message": "Booking not found.",
  "code": "404",
  "reference_type": "booking_reference",
  "reference_number": "BK-2025-99999"
}
```

---

## 18. Medical Requests (EMR Intake)

Medical requests represent radiology/imaging orders from EMR systems processed through the DICOM MWL workflow.

### POST `/requests/emr-intake`

Main entry point for EMR requests. Validates procedures, selects equipment, persists the request for Orthanc-driven workflow.

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `request_id` | string | Yes | EMR system request ID, 1–100 chars |
| `patient_id` | string | Yes | Patient identifier, 1–100 chars |
| `patient_first_name` | string | Yes | 1–100 chars |
| `patient_last_name` | string | No | Max 100 chars |
| `patient_mrn` | string | No | Medical record number |
| `date_of_birth` | date | No | |
| `sex` | string | No | `M`, `F`, `U`, `O`, default `U` |
| `modality` | string | No | Legacy modality code, max 32 chars |
| `description` | string | No | Max 500 chars |
| `institution_name` | string | No | Max 255 chars |
| `procedures` | array | Yes | SHA procedure codes (min 1) |
| `facility_id` | string | Yes | 1–50 chars |
| `claim_id` | string | No | Max 100 chars |
| `payor` | string | No | Max 100 chars |
| `preauth_code` | string | No | Max 100 chars |
| `callback_url` | uri | No | Max 2083 chars |
| `callback_auth_type` | string | No | Default `Bearer` |
| `callback_auth_token` | string | No | Max 500 chars |
| `idempotency_key` | string | Yes | Unique key for idempotency |
| `request_metadata` | object | No | |

**Response `202`**

```json
{
  "internal_request_id": "uuid",
  "status": "pending",
  "procedures_mapped": 2,
  "equipment_count": 1,
  "message": "Request processed successfully",
  "split_count": 1
}
```

---

### POST `/requests/claim`

Attach or clear the EMR claim ID after claim posting.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `claim_id` | string | Yes | 1–100 chars |
| `payor` | string | No | Max 100 chars |
| `preauth_code` | string | No | Max 100 chars |
| `request_id` | string | No | EMR request ID |
| `internal_request_id` | string | No | Middleware request ID |

---

### GET `/requests`

List medical requests with filtering and pagination.

**Query Parameters**

| Param | Type | Notes |
|-------|------|-------|
| `status` | string | `pending`, `in_progress`, `completed`, `failed`, `cancelled` |
| `patient_id` | string | |
| `patient` | string | Patient name search |
| `facility_id` | string | |
| `facility_name` | string | |
| `page` | integer | Default 1 |
| `page_size` | integer | 1–100, default 20 |

---

### GET `/requests/{request_id}`

Get detailed medical request information including equipment assignments.

---

### GET `/requests/by-internal-id/{internal_request_id}`

Get medical request by internal middleware ID.

---

### POST `/requests/{request_id}/cancel`

Cancel a pending or in-progress request.

---

### GET `/requests/{request_id}/callback-logs`

Get callback logs for a request (EMR notification history).

---

### GET `/requests/{request_id}/eligible-equipment`

Return only equipment that can handle this request's procedures for the given facility.

| Param | Type | Notes |
|-------|------|-------|
| `facility_id` | string | Target facility |

---

### POST `/requests/{request_id}/retarget`

Change request target facility/equipment and reset assignment for worklist resend.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `facility_id` | string | Yes | 1–50 chars |
| `equipment_id` | uuid | Yes | |

**Response `200`**

```json
{
  "internal_request_id": "uuid",
  "status": "pending",
  "status_message": "Request retargeted. MWL will be regenerated.",
  "facility_id": "14062",
  "equipment_id": "uuid",
  "equipment_asset_id": "XRAY-001",
  "equipment_dicom_aet": "GEXR001"
}
```

---

### POST `/requests/{request_id}/mwl/regenerate`

Resend worklist(s) through Orthanc's API and verify MWL publication.

**Response `200`**

```json
{
  "internal_request_id": "uuid",
  "status": "pending",
  "status_message": "MWL regenerated",
  "generated_files": 1,
  "queued": 1,
  "succeeded": 1,
  "failed": 0,
  "dead_lettered": 0
}
```

---

### POST `/requests/{request_id}/simulate-orthanc-result`

Simulate a C-STORE result from Orthanc and send the EMR callback. (Testing only.)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `equipment_id` | uuid | No | |
| `procedure_code` | string | No | 1–50 chars |
| `status` | string | No | Default `final` |
| `performed_at` | datetime | No | |
| `result_payload` | object | No | |

---

### GET `/requests/stats/summary`

Get request statistics.

| Param | Type | Notes |
|-------|------|-------|
| `facility_id` | string | Filter by facility |
| `days` | integer | 1–90, default 7 |

---

## 19. DICOM Events & Callbacks

### POST `/dicom/events/mpps`

Receive MPPS (Modality Performed Procedure Step) event update from equipment.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `internal_request_id` | string | Yes | |
| `equipment_id` | string | No | Equipment UUID |
| `equipment_code` | string | No | Equipment code, asset_id, or DICOM AET |
| `procedure_code` | string | Yes | |
| `status` | string | Yes | |
| `performed_at` | datetime | No | |
| `payload` | object | No | |

---

### POST `/dicom/events/c-store`

Receive C-STORE payload and persist structured result.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `internal_request_id` | string | Yes | |
| `equipment_id` | string | No | Equipment UUID |
| `equipment_code` | string | No | Equipment code, asset_id, or DICOM AET |
| `procedure_code` | string | Yes | |
| `performed_at` | datetime | No | |
| `result_payload` | object | Yes | |

---

### POST `/dicom/events/ping-request`

Receive machine ping/test-connection event from Orthanc and queue for approval.

Same body as `POST /equipment/ping-requests`.

---

### GET `/dicom/events/ping-events`

List Orthanc ping events.

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `event_type` | string | `ping` | |
| `forwarded` | boolean | `false` | |
| `page` | integer | 1 | |
| `page_size` | integer | 50 | 1–500 |

---

### GET `/dicom/dead-letters`

List dead-lettered DICOM events for operations follow-up.

| Param | Type | Notes |
|-------|------|-------|
| `status` | string | `open`, `retrying`, `resolved` |

---

## 20. SHA Verification & Interventions

SHA (Social Health Authority) verification endpoints. **Auth required.**

### POST `/sha/verification`

Verify equipment use for SHA using patient/procedure/facility/time tuple.

If `time_done` is provided, a ±15 minute matching window is used.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `patient_id` | string | Yes | |
| `procedure` | string | Yes | Procedure code |
| `facility_id` | string | Yes | |
| `time_done` | datetime | No | |

**Response `200`**

```json
{
  "patient_id": "PAT-001",
  "procedure": "XRAY-CHEST-PA",
  "facility_id": "14062",
  "validate_equipment_use": true,
  "equipment_id": "uuid",
  "internal_request_id": "uuid",
  "results": {}
}
```

---

### POST `/sha/v1/verification`

Verify equipment use using request identifiers.

Accepts `request_id` (EMR request id) or `internal_request_id` (middleware id). At least one identifier required.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `request_id` | string | No | 1–100 chars |
| `internal_request_id` | string | No | 1–100 chars |

---

### POST `/sha/v1/claim-verification`

Return EMR booking and service details for SHA claim verification.

Accepts `request_id`, `internal_request_id`, or `claim_id`. At least one identifier required.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `request_id` | string | No | EMR booking number |
| `internal_request_id` | string | No | Middleware ID |
| `claim_id` | string | No | Claim ID |

---

### POST `/sha/v2/verification`

Verify claim details by source.

- `hmis` uses the middleware's internal claim lookup.
- `provider_portal` proxies the request to VEMS.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `claim_id` | string | Yes | 1–100 chars |
| `source` | string | Yes | `provider_portal` or `hmis` |

---

### GET `/sha/interventions`

Expose completed interventions with request, equipment, timing, and result details.

**Query Parameters**

| Param | Type | Notes |
|-------|------|-------|
| `patient_id` | string | |
| `id_number` | string | National ID / MRN lookup |
| `emr_request_id` | string | |
| `facility_id` | string | |
| `internal_request_id` | string | |

---

### POST `/sha/callback/claim-status`

> **Internal** — SHA callback endpoint for claim status updates.

---

## 21. Admin Dashboard & Analytics

> **Auth required.** Admin oversight endpoints.

### GET `/admin/dashboard`

High-level counts, modality breakdown, SHA claim stats, recent patient activity, and efficiency stats.

**Response `200`**

```json
{
  "counts": {
    "total_vendors": 5,
    "total_equipment": 42,
    "equipment_by_owner": { "vendor_owned": 30, "facility_owned": 12 },
    "total_facilities": 18,
    "completed_studies": 156,
    "active_worklists": 12
  },
  "sha_claims": {
    "total_claims": 15,
    "paid": { "count": 10, "amount": 250000.00, "vendor_share": 175000.00, "facility_share": 75000.00 },
    "rejected": { "count": 3 },
    "pending": { "count": 2 },
    "bookings_by_status": { "pending": 5, "submitted": 3, "approved": 2, "Payment-completed": 10, "rejected": 3, "clinical-review": 1 }
  },
  "modalities": [
    { "modality": "CT", "label": "CT", "count": 3, "categories": [...] },
    { "modality": "DX", "label": "DX", "count": 8, "categories": [...] }
  ],
  "recent_activity": [...],
  "efficiency": {
    "period_days": 30, "total_scheduled": 200,
    "total_completed": 156, "total_cancelled": 12,
    "completion_rate": 78.0,
    "daily_breakdown": [...]
  }
}
```

---

### GET `/admin/equipment`

Paginated equipment listing with modality, category, status, search, and vendor filters.

**Query Parameters**

| Param | Type | Default | Values |
|-------|------|---------|--------|
| `modality` | string | — | `CT`, `DX`, `MR`, `US`, `MG`, `NM`, `PT`, `XA`, `RF`, `ECG`, `RTPLAN`, `RTSIM`, `non_imaging` |
| `category` | string | — | Any equipment category value |
| `status` | string | — | Any equipment status value |
| `search` | string | — | Free-text search |
| `vendor_id` | uuid | — | |
| `sort_by` | string | `name` | `name`, `code`, `category`, `status`, `created_at` |
| `sort_order` | string | `asc` | `asc`, `desc` |
| `per_page` | integer | 15 | 1–100 |

---

### Analytics Endpoints

All analytics require authentication.

| Endpoint | Description |
|----------|-------------|
| `GET /analytics/vendors/by-equipments` | Vendor ranking by equipment count |
| `GET /analytics/vendors/by-facilities-supporting` | Vendor ranking by facilities supported |
| `GET /analytics/vendors/by-procedures` | Vendor ranking by procedures performed |
| `GET /analytics/vendors/by-procedure-type` | Vendor breakdown by procedure type |
| `GET /analytics/facilities/by-procedures` | Facility ranking by procedures |
| `GET /analytics/facilities/by-procedure-type` | Facility breakdown by procedure type |
| `GET /analytics/facilities/by-vendor` | Facility ranking by vendors engaged |
| `GET /analytics/reports/procedure-costs` | Procedure cost report |
| `GET /analytics/reports/procedure-costs/export` | Export procedure cost report |

Procedure analytics accept `start_time`, `end_time`, and `procedure_type` query params. Cost reports accept `vendor`, `facility`, `equipment`, `modality`, `procedure`, `status`, `start_date`, `end_date`.

---

## 22. Users & Permissions (Admin)

Admin user and permission management. **Auth required.**

### GET `/users` (Admin scope)

List users with pagination and filtering.

| Param | Type | Notes |
|-------|------|-------|
| `is_active` | boolean | |
| `search` | string | |
| `page` | integer | Default 1 |
| `page_size` | integer | 1–100, default 20 |

---

### POST `/users`

Create a new user.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `username` | string | Yes | 3–100 chars |
| `email` | email | Yes | 3–255 chars |
| `password` | string | Yes | 8–72 chars |
| `full_name` | string | No | Max 255 chars |
| `is_active` | boolean | No | Default `true` |
| `is_superuser` | boolean | No | Default `false` |
| `is_facility` | boolean | No | Default `false` |
| `is_vendor` | boolean | No | Default `false` |
| `facility_id` | string | No | Max 50 chars |
| `vendor_id` | uuid | No | |

---

### GET `/users/{user_id}`

Get user by ID. Includes assigned permissions.

---

### PUT `/users/{user_id}`

Update user. All fields optional (email, full_name, password, is_active, is_superuser, is_facility, is_vendor, facility_id, vendor_id).

---

### DELETE `/users/{user_id}`

Soft-delete user. Returns `204`.

---

### Permissions Management

#### GET `/admin/permissions`

List permissions with pagination.

| Param | Type | Notes |
|-------|------|-------|
| `is_active` | boolean | |
| `search` | string | |
| `page` | integer | Default 1 |
| `page_size` | integer | 1–100, default 20 |

#### POST `/admin/permissions`

Create a permission.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `code` | string | Yes | 3–50 chars, unique |
| `name` | string | Yes | 1–150 chars |
| `description` | string | No | |
| `resource` | string | Yes | 1–100 chars |
| `action` | string | Yes | 1–50 chars |
| `is_active` | boolean | No | Default `true` |

#### GET `/admin/permissions/{permission_id}`

Get permission by ID.

#### PUT `/admin/permissions/{permission_id}`

Update permission (name, description, resource, action, is_active). All fields optional.

#### DELETE `/admin/permissions/{permission_id}`

Soft-delete permission. Returns `204`.

---

### User-Permission Assignment

#### GET `/admin/users/{user_id}/permissions`

List permissions assigned to a user.

#### POST `/admin/users/{user_id}/permissions/{permission_id}`

Assign a permission to a user.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `granted_by` | string | No | Admin user ID |

#### DELETE `/admin/users/{user_id}/permissions/{permission_id}`

Unassign a permission from a user. Returns `204`.

---

## 23. Revenue Distributions (Settings)

Manage revenue share distribution periods between vendors and facilities. **Auth required.**

### GET `/settings/revenue-distributions`

List active revenue distribution periods.

---

### POST `/settings/revenue-distributions`

Create a revenue distribution period.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `vendor_percentage` | number | Yes | 0–100 |
| `facility_percentage` | number | Yes | 0–100 |
| `start_date` | date | Yes | |
| `end_date` | date | Yes | |
| `active` | boolean | No | Default `true` |

**Response `201`** — Distribution created.

---

### PUT `/settings/revenue-distributions/{distribution_id}`

Update a revenue distribution period. All fields optional.

---

## 24. Health & System

### GET `/health`

Health check endpoint — returns system status.

**Response `200`** — System is running.

### GET `/`

Root endpoint — returns API information.

**Response `200`**

```json
{
  "name": "DHA Equipment Middleware",
  "version": "1.0.0",
  "status": "operational"
}
```

---

## 25. Error Reference

### Common Error Codes

| Code | Meaning |
|------|---------|
| `VALIDATION_ERROR` | Request body failed validation — check `errors` object |
| `INVALID_SERVICES` | All services in the request are invalid |
| `SERVICE_NOT_FOUND` | `contract_service_id` does not exist |
| `SERVICE_FACILITY_MISMATCH` | Service does not belong to the selected facility |
| `CONTRACT_INACTIVE` | The service's contract is not active |
| `SERVICE_INACTIVE` | The specific service is disabled |
| `EQUIPMENT_UNAVAILABLE` | Equipment linked to service is not active |
| `NO_VALID_SERVICES` | No services could be booked — full rollback |
| `SESSION_EXPIRED` | OTP session has timed out |
| `MAX_ATTEMPTS_EXCEEDED` | Too many wrong OTP attempts — session locked |
| `MAX_RESENDS_EXCEEDED` | Too many OTP resend requests |
| `SERVICE_ALREADY_COMPLETED` | Cannot act on an already-completed service |
| `SERVICE_CANCELLED` | Cannot act on a cancelled service |
| `AMOUNT_MISMATCH` | Finance breakdown totals do not equal the tariff |

### HTTP Status Codes

| Status | When |
|--------|------|
| `200` | Success (GET, updates) |
| `201` | Created (POST — new resource) |
| `400` | Business rule violation |
| `401` | Missing or invalid token |
| `403` | Account inactive or insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict (e.g., patient already exists) |
| `410` | Gone — session expired or consumed |
| `422` | Validation failed |
| `429` | Rate limited |
| `500` | Server error |

---

## Appendix: Shared Object Shapes

### Booking Detail Object

```json
{
  "id": "uuid",
  "booking_number": "BK-2025-00042",
  "patient": {
    "id": "uuid",
    "name": "John Kamau",
    "phone": "+254711000000",
    "identification_no": "12345678",
    "sha_number": "SHA/0001234",
    "date_of_birth": "1990-05-10",
    "gender": "male"
  },
  "facility": { "id": "uuid", "name": "KNH", "fr_code": "14062" },
  "source": "standalone",
  "status": "active",
  "override": false,
  "payment": {
    "tariff": "7000.00",
    "cash": "1000.00",
    "other_insurance": "0.00",
    "sha": "6000.00"
  },
  "eligibility_verified": true,
  "eligibility_response": { ... },
  "finance_approved_at": "2025-05-01T09:15:00+03:00",
  "notes": "Routine follow-up",
  "services": [ ...booked service objects... ],
  "created_by": { "id": "uuid", "name": "Dr. Jane Doe" },
  "created_at": "2025-05-01T09:00:00+03:00",
  "updated_at": "2025-05-01T09:15:00+03:00"
}
```

### Booked Service Object

```json
{
  "lot": { "number": "LOT-01", "name": "Radiology Lot 1" },
  "service": {
    "id": "uuid",
    "code": "XRAY-CHEST-PA",
    "name": "Chest X-Ray PA"
  },
  "scheduled_date": "2025-06-01",
  "tariff": "3500.00",
  "payment": {
    "cash": "500.00",
    "other_insurance": "0.00",
    "sha": "3000.00"
  },
  "revenue": {
    "vendor_share": "2100.00",
    "facility_share": "1400.00"
  },
  "equipment": {
    "id": "uuid",
    "code": "XRAY-001",
    "name": "GE Discovery XR656",
    "status": "active"
  },
  "practitioner": { "id": "uuid", "name": "Dr. Alice Odhiambo" },
  "status": "not_started",
  "cancel_reason": null,
  "notes": null,
  "equipment_assigned_at": null,
  "started_at": null,
  "completed_at": null,
  "result": null
}
```

**Service statuses:** `not_started` → `completed` or `cancelled`

**`result` object** — populated automatically by Orthanc when the DICOM scan completes:

```json
{
  "accession_number": "ACC-2025-00123",
  "modality": "CR",
  "study_description": "Chest PA",
  "result_status": "final",
  "result_body": "No acute cardiopulmonary findings.",
  "observations": "Lungs are clear bilaterally.",
  "performing_technologist": "John Tech",
  "interpreting_physician": "Dr. Radiologist",
  "has_critical_values": false,
  "received_at": "2025-05-01T11:30:00+03:00",
  "worklist_status": "completed"
}
```
