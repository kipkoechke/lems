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

| Endpoint                                 | Method         | Description                    |
| ---------------------------------------- | -------------- | ------------------------------ |
| `/auth/login`                            | POST           | Authenticate                   |
| `/auth/logout`                           | POST           | Logout                         |
| `/auth/me`                               | GET            | Current user                   |
| `/auth/forgot-password`                  | POST           | Email a password reset link    |
| `/auth/reset-password`                   | POST           | Set a new password from a link |
| `/users`                                 | GET/POST       | List / Create users            |
| `/users/{id}`                            | GET/PUT/DELETE | User CRUD                      |
| `/users/roles`                           | GET            | Roles this caller may assign   |
| `/users/{id}/password-reset-link`        | POST           | Email a colleague a reset link |
| `/admin/dashboard`                       | GET            | Dashboard overview             |
| `/admin/equipment`                       | GET            | Equipment listing              |
| `/admin/facility-readiness`              | GET            | Equipment readiness by facility |
| `/admin/facility-ranking`                | GET            | Facility bookings ranking      |
| `/admin/permissions`                     | GET/POST       | List / Create permissions      |
| `/admin/permissions/{id}`                | GET/PUT/DELETE | Permission CRUD                |
| `/admin/users/{id}/permissions`          | GET            | List user permissions          |
| `/admin/users/{id}/permissions/{pid}`    | POST/DELETE    | Assign / Unassign permission   |
| `/equipment-status/*`                    | *              | Equipment status logs          |
| `/dicom/server/status`                   | GET            | DICOM server status            |
| `/dicom/modalities`                      | GET            | List modalities                |
| `/dicom/modalities/register-all`         | POST           | Register all modalities        |
| `/dicom/equipment/{id}/configure`        | POST           | Configure DICOM                |
| `/dicom/equipment/{id}/register`         | POST/DELETE    | Register / Unregister          |
| `/dicom/equipment/{id}/test`             | POST           | Test connection                |
| `/dicom/equipment/{id}/status`           | GET            | Equipment DICOM status         |
| `/dicom/events/ping-events`              | GET            | Device activity log            |
| `/dicom/dead-letters`                    | GET            | Failed DICOM events            |
| `/dicom/callback/result`                 | POST           | DICOM result callback, including non-SHA studies |
| `/dicom/callback/status`                 | POST           | DICOM status callback          |
| `/equipment/ping-requests/*`             | *              | Equipment ping requests        |
| `/equipment/ping-requests/activity`      | GET            | Device activity log            |
| `/equipment/ping-requests/pending-installation` | GET     | Equipment awaiting installation |
| `/equipment/{id}/publish-orthanc`        | POST           | Publish to Orthanc             |
| `/equipment/sync-dicom-aet`              | POST           | Sync DICOM AET                 |
| `/equipment/facility/{id}/operational`   | GET            | Facility operational equipment |
| `/procedures`                            | GET/POST       | List / Create SHA procedures   |
| `/procedures/{id}`                       | GET/PUT/DELETE | Procedure CRUD                 |
| `/requests`                              | GET            | List medical requests          |
| `/requests/{id}`                         | GET            | Request details                |
| `/requests/{id}/cancel`                  | POST           | Cancel request                 |
| `/requests/{id}/retarget`                | POST           | Retarget request               |
| `/requests/{id}/mwl/regenerate`          | POST           | Regenerate MWL                 |
| `/requests/{id}/simulate-orthanc-result` | POST           | Simulate Orthanc result        |
| `/requests/stats/summary`                | GET            | Request stats                  |
| `/lots`                                  | GET/POST       | List / Create lots             |
| `/lots/{id}`                             | GET/PUT/DELETE | Lot CRUD                       |
| `/lots/{id}/services`                    | GET/POST       | Lot services                   |
| `/contracts`                             | GET/POST       | List / Create contracts        |
| `/contracts/{id}`                        | GET/PUT/DELETE | Contract CRUD                  |
| `/contracts/{id}/services`               | GET/POST       | Contract services              |
| `/vendors`                               | GET/POST       | List / Create vendors          |
| `/vendors/{id}`                          | GET/PUT/DELETE | Vendor CRUD                    |
| `/vendors/{id}/equipments`               | GET/POST       | Vendor equipment               |
| `/vendors/{id}/equipments/{eid}`         | GET/PATCH      | Vendor equipment detail        |
| `/vendors/{id}/bookings`                 | GET            | Vendor bookings                |
| `/vendors/{id}/dashboard`                | GET            | Vendor dashboard               |
| `/settings/revenue-distributions`        | GET/POST       | Revenue distributions          |
| `/settings/revenue-distributions/{id}`   | PUT            | Update distribution            |
| `/analytics/*`                           | GET            | All analytics endpoints        |
| `/sha/interventions`                     | GET            | SHA interventions list         |
| `/sha/callback/claim-status`             | POST           | SHA claim status callback      |

### NESP Admin (`nesp`) / MOH Admin (`moh`) / COG Admin (`cog`)

Read-only oversight across the system.

| Endpoint                               | Method | Description                    |
| -------------------------------------- | ------ | ------------------------------ |
| `/auth/login`                          | POST   | Authenticate                   |
| `/auth/logout`                         | POST   | Logout                         |
| `/auth/me`                             | GET    | Current user                   |
| `/facilities`                          | GET    | List facilities                |
| `/facilities/{id}`                     | GET    | Get facility                   |
| `/facilities/fr/search`                | GET    | Search FR registry             |
| `/equipment/{id}`                      | GET    | Get equipment (admin view)     |
| `/equipment/facility/{id}/operational` | GET    | Facility operational equipment |
| `/vendors`                             | GET    | List vendors                   |
| `/vendors/{id}`                        | GET    | Get vendor                     |
| `/vendors/{id}/equipments`             | GET    | Vendor equipment               |
| `/vendors/{id}/bookings`               | GET    | Vendor bookings                |
| `/vendors/{id}/dashboard`              | GET    | Vendor dashboard               |
| `/admin/dashboard`                     | GET    | Dashboard overview             |
| `/admin/equipment`                     | GET    | Equipment listing              |
| `/admin/facility-readiness`            | GET    | Equipment readiness by facility |
| `/admin/facility-ranking`              | GET    | Facility bookings ranking      |
| `/analytics/*`                         | GET    | All analytics endpoints        |
| `/requests/stats/summary`              | GET    | Request stats                  |
| `/sha/interventions`                   | GET    | SHA interventions list         |

### Vendor User (`vendor`)

Manage own vendor profile, equipment, and bookings via the dedicated Vendor Portal (`/vendor` prefix). Admin-level vendor endpoints are also accessible via `/vendors/{vendor}` for own vendor.

**Vendor Portal** (`/vendor` prefix — `role:vendor`)

| Endpoint                                  | Method | Description                     |
| ----------------------------------------- | ------ | ------------------------------- |
| `/vendor/equipments`                      | GET    | List own equipment              |
| `/vendor/equipments/{id}`                 | GET    | Equipment detail                |
| `/vendor/equipments/{id}/configure`       | POST   | Configure DICOM                 |
| `/vendor/equipments/{id}/test-connection` | POST   | Test C-ECHO                     |
| `/vendor/equipments/{id}/dicom-status`    | GET    | DICOM connection status         |
| `/vendor/worklist-test`                   | POST   | Send test worklist              |
| `/vendor/bookings`                        | GET    | View bookings for own equipment |
| `/vendor/dashboard`                       | GET    | Vendor dashboard                |
| `/vendor/contracts`                       | GET    | View own contracts              |
| `/vendor/contracts/{id}`                  | GET    | Contract detail                 |
| `/vendor/contracts/{id}/services`         | GET    | Contract services               |

**Admin Vendor Endpoints** (auth:sanctum, own vendor only)

| Endpoint                            | Method    | Description             |
| ----------------------------------- | --------- | ----------------------- |
| `/vendors/{vendor}`                 | GET/PUT   | Get / Update own vendor |
| `/vendors/{vendor}/equipments`      | GET/POST  | List / Add equipment    |
| `/vendors/{vendor}/equipments/{id}` | GET/PATCH | Get / Update equipment  |
| `/vendors/{vendor}/bookings`        | GET       | View bookings           |
| `/vendors/{vendor}/dashboard`       | GET       | Vendor dashboard        |
| `/vendors/{vendor}/contracts`       | GET       | View contracts          |

### Facility Admin (`f_admin`)

Manage facility, bookings, patients, contracts, and users.

| Endpoint                                                | Method           | Description                      |
| ------------------------------------------------------- | ---------------- | -------------------------------- |
| `/auth/login`                                           | POST             | Authenticate                     |
| `/auth/logout`                                          | POST             | Logout                           |
| `/facilities`                                           | GET/POST         | List / Create facilities         |
| `/facilities/{id}`                                      | GET/PUT          | Get / Update facility            |
| `/facilities/fr/search`                                 | GET              | Search FR registry               |
| `/patients`                                             | GET/POST         | List / Fetch patients            |
| `/patients/{id}`                                        | GET/DELETE       | Get / Delete patient             |
| `/patients/{id}/bookings`                               | GET              | Patient bookings                 |
| `/patients/eligibility`                                 | POST             | Check SHA eligibility            |
| `/lots`                                                 | GET/POST         | List / Create lots               |
| `/lots/{id}`                                            | GET/PUT/DELETE   | Lot CRUD                         |
| `/lots/{lot}/services`                                  | GET/POST         | List / Add lot services          |
| `/lots/{lot}/services/{id}`                             | GET/PATCH/DELETE | Service CRUD                     |
| `/contracts`                                            | GET/POST         | List / Create contracts          |
| `/contracts/{id}`                                       | GET/PUT/DELETE   | Contract CRUD                    |
| `/contracts/{contract}/services`                        | GET/POST         | List / Add contract services     |
| `/contracts/{contract}/services/{id}`                   | PATCH/DELETE     | Update / Delete contract service |
| `/contracts/facility/{facility}/discover`               | GET              | Discover contract services       |
| `/bookings`                                             | GET/POST         | List / Create bookings           |
| `/bookings/{id}`                                        | GET              | Booking details                  |
| `/bookings/{booking}/cancel`                            | POST             | Cancel booking                   |
| `/bookings/{booking}/services`                          | GET              | Booking services                 |
| `/bookings/{booking}/approve-finance`                   | POST             | Approve finance                  |
| `/bookings/{booking}/services/{sid}/assign-equipment`   | POST             | Assign equipment                 |
| `/bookings/{booking}/services/{sid}/request-completion` | POST             | Request completion OTP           |
| `/bookings/{booking}/services/{sid}/verify-completion`  | POST             | Verify completion OTP            |
| `/bookings/{booking}/services/{sid}/resend-completion`  | POST             | Resend completion OTP            |
| `/bookings/{booking}/services/{sid}/complete`           | POST             | Complete service                 |
| `/bookings/initiate`                                    | POST             | Initiate OTP booking             |
| `/bookings/verify-otp`                                  | POST             | Verify booking OTP               |
| `/bookings/resend-otp`                                  | POST             | Resend booking OTP               |
| `/bookings/session-status`                              | GET              | Poll session status              |
| `/professionals`                                        | POST             | Register professional            |
| `/practitioner/worklist`                                | GET              | Practitioner worklist            |
| `/users`                                                | GET/POST         | List / create users in own facility (view-only, practitioner, finance, equipment — never another admin) |
| `/users/{id}`                                           | GET              | Get a user in own facility       |
| `/facility/equipments`                                  | GET/POST         | List own + vendor-mapped equipment / add own equipment |
| `/facility/equipments/{id}`                             | GET              | Facility equipment detail        |
| `/facility/dashboard`                                   | GET              | Facility dashboard + connectivity card |
| `/admin/dashboard`                                      | GET              | Facility dashboard               |

### Finance Manager (`f_finance`)

Approve bookings, manage payments.

| Endpoint                                              | Method | Description           |
| ----------------------------------------------------- | ------ | --------------------- |
| `/auth/login`                                         | POST   | Authenticate          |
| `/auth/logout`                                        | POST   | Logout                |
| `/bookings`                                           | GET    | List bookings         |
| `/bookings/{id}`                                      | GET    | Booking details       |
| `/bookings/{booking}/services`                        | GET    | Booking services      |
| `/bookings/{booking}/approve-finance`                 | POST   | Approve finance       |
| `/bookings/{booking}/services/{sid}/assign-equipment` | POST   | Assign equipment      |
| `/patients/eligibility`                               | POST   | Check SHA eligibility |

### Practitioner (`f_practitioner`)

Clinical operations — recommend and complete services.

| Endpoint                                                | Method   | Description                    |
| ------------------------------------------------------- | -------- | ------------------------------ |
| `/auth/login`                                           | POST     | Authenticate                   |
| `/auth/logout`                                          | POST     | Logout                         |
| `/patients`                                             | GET/POST | List / Fetch patients          |
| `/patients/{id}`                                        | GET      | Get patient                    |
| `/patients/{id}/bookings`                               | GET      | Patient bookings               |
| `/patients/eligibility`                                 | POST     | Check SHA eligibility          |
| `/practitioner/worklist`                                | GET      | Practitioner worklist          |
| `/bookings`                                             | GET/POST | List / Create bookings         |
| `/bookings/{id}`                                        | GET      | Booking details                |
| `/bookings/{booking}/services`                          | GET      | Booking services               |
| `/bookings/{booking}/services/{sid}/request-completion` | POST     | Request completion OTP         |
| `/bookings/{booking}/services/{sid}/verify-completion`  | POST     | Verify completion OTP          |
| `/bookings/{booking}/services/{sid}/resend-completion`  | POST     | Resend completion OTP          |
| `/bookings/{booking}/services/{sid}/complete`           | POST     | Complete service               |
| `/bookings/initiate`                                    | POST     | Initiate OTP booking           |
| `/bookings/verify-otp`                                  | POST     | Verify booking OTP             |
| `/bookings/resend-otp`                                  | POST     | Resend booking OTP             |
| `/bookings/session-status`                              | GET      | Poll session status            |
| `/equipment/facility/{facility}/operational`            | GET      | Facility operational equipment |

### Equipment User (`f_equipment_user`)

Equipment operation only.

| Endpoint                                                | Method | Description                    |
| ------------------------------------------------------- | ------ | ------------------------------ |
| `/auth/login`                                           | POST   | Authenticate                   |
| `/auth/logout`                                          | POST   | Logout                         |
| `/bookings/{booking}/services`                          | GET    | Booking services               |
| `/bookings/{booking}/services/{sid}/request-completion` | POST   | Request completion OTP         |
| `/bookings/{booking}/services/{sid}/verify-completion`  | POST   | Verify completion OTP          |
| `/bookings/{booking}/services/{sid}/resend-completion`  | POST   | Resend completion OTP          |
| `/bookings/{booking}/services/{sid}/complete`           | POST   | Complete service               |
| `/equipment/facility/{facility}/operational`            | GET    | Facility operational equipment |
| `/dicom/equipment/{id}/test`                            | POST   | Test DICOM connection          |
| `/dicom/equipment/{id}/status`                          | GET    | Equipment DICOM status         |

### View Only (`f_view_only`)

Read-only access to a facility. A view-only account is provisioned by the
facility admin (HRIO) and is always scoped to that admin's facility — see
[Users & Permissions (Admin)](#22-users--permissions-admin).

| Endpoint                       | Method | Description                    |
| ------------------------------ | ------ | ------------------------------ |
| `/auth/login`                  | POST   | Authenticate                   |
| `/auth/logout`                 | POST   | Logout                         |
| `/auth/me`                     | GET    | Current user                   |
| `/auth/me/permissions`         | GET    | Current user permissions       |
| `/facilities`                  | GET    | List facilities                |
| `/facilities/{id}`             | GET    | Get facility                   |
| `/patients`                    | GET    | List patients                  |
| `/patients/{id}`               | GET    | Get patient                    |
| `/bookings`                    | GET    | List bookings                  |
| `/bookings/{id}`               | GET    | Booking details                |
| `/bookings/{booking}/services` | GET    | Booking services               |
| `/contracts`                   | GET    | List contracts                 |
| `/contracts/{id}`              | GET    | Contract detail                |
| `/lots`                        | GET    | List lots                      |
| `/facility/equipments`         | GET    | Own facility equipment         |
| `/facility/equipments/{id}`    | GET    | Own facility equipment detail  |
| `/facility/dashboard`          | GET    | Facility dashboard             |
| `/procedures`                  | GET    | List SHA procedures            |
| `/requests`                    | GET    | List medical requests          |
| `/analytics/*`                 | GET    | Read-only analytics            |

### Provider Portal (`provider_portal`)

HMIS integration — create worklist bookings from external systems.

All routes require `role:provider_portal` under the `/provider` prefix.

| Endpoint                        | Method | Description                                                  |
| ------------------------------- | ------ | ------------------------------------------------------------ |
| `/auth/login`                   | POST   | Authenticate (returns token only)                            |
| `/auth/logout`                  | POST   | Logout                                                       |
| `/provider/facilities/services` | GET    | Facility services                                            |
| `/provider/book`                | POST   | Create booking worklist                                      |
| `/provider/bookings`            | GET    | List bookings                                                |
| `/provider/bookings/show`       | GET    | Get booking (query: `?visit_id=` or `?claim_id=`)            |
| `/provider/bookings/costs`      | GET    | Booking cost breakdown (query: `?visit_id=` or `?claim_id=`) |
| `/provider/bookings/claim`      | POST   | Assign claim ID                                              |
| `/provider/bookings/services`   | POST   | Add services to booking                                      |

### Payer (`payer`)

Validate services in VEMS for claim processing.

All routes require `role:payer` under the `/payer` prefix.

| Endpoint          | Method | Description                       |
| ----------------- | ------ | --------------------------------- |
| `/auth/login`     | POST   | Authenticate (returns token only) |
| `/auth/logout`    | POST   | Logout                            |
| `/payer/validate` | GET    | Validate services for payer       |

---

## 1. Authentication

### Passwords

Accounts are handed over by email, never with a password. A newly created user
is issued a **random password nobody is told** — not even the person who created
the account — and the welcome mail carries a single-use link to set their own.
The same link mechanism, and the same token, serves anyone who has forgotten
their password later.

Links are built against `FRONTEND_URL` and point at
`{FRONTEND_URL}/reset-password?token=...&email=...`. They are valid for
`PASSWORD_RESET_EXPIRE_MINUTES` (1440 — 24 hours — by default, deliberately
longer than Laravel's 60, or an invitation sent on a Friday would expire), and
each can be used once.

Every one of these mails is **queued**, so no request waits on a mail server.
The queue worker must be running (it is, under `[program:queue-worker]`).

#### POST `/auth/forgot-password`

Email a reset link to an account. **Public.**

Answers identically whether or not the address is registered, so it cannot be
used to discover who has an account here. Throttled to three requests per
address per minute.

| Field   | Type  | Required |
| ------- | ----- | -------- |
| `email` | email | Yes      |

```json
{ "data": null, "message": "If that email address has an account, a reset link is on its way." }
```

#### POST `/auth/reset-password`

Set a new password from a link. **Public.**

| Field                   | Type   | Required | Notes                          |
| ----------------------- | ------ | -------- | ------------------------------ |
| `email`                 | email  | Yes      |                                |
| `token`                 | string | Yes      | From the link                  |
| `password`              | string | Yes      | Minimum 8 characters, confirmed |
| `password_confirmation` | string | Yes      |                                |

**`200`** — `{ "message": "Your password has been reset. You can now sign in." }`
**`422`** — the link is invalid, expired, or already used. An expired link is
ordinary: request a new one.

### POST `/auth/login`

Authenticates a user and returns a bearer token.

**Request Body**

| Field      | Type   | Required | Notes                                          |
| ---------- | ------ | -------- | ---------------------------------------------- |
| `login`    | string | Yes*     | Email or phone. Use either `login` or `email`. |
| `email`    | string | Yes*     | Alias for `login`.                             |
| `password` | string | Yes      |                                                |

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

| Param           | Type    | Notes                                                  |
| --------------- | ------- | ------------------------------------------------------ |
| `search`        | string  | Searches name, ID number, phone, CR number, SHA number |
| `county_id`     | uuid    |                                                        |
| `sub_county_id` | uuid    |                                                        |
| `ward_id`       | uuid    |                                                        |
| `is_dependant`  | boolean | `true` = dependants only                               |
| `is_alive`      | boolean |                                                        |
| `sort_by`       | string  | `name`, `date_of_birth`, `created_at`                  |
| `sort_order`    | string  | `asc`, `desc`                                          |
| `per_page`      | integer | 1–100, default 15                                      |

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

| Field                   | Type   | Required | Notes                                                                     |
| ----------------------- | ------ | -------- | ------------------------------------------------------------------------- |
| `identification_type`   | string | Yes      | `National ID`, `Birth Certificate`, `Passport`, `SHA Number`, `CR Number` |
| `identification_number` | string | Yes      | The patient's ID number                                                   |

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

| Param        | Type    | Notes                                             |
| ------------ | ------- | ------------------------------------------------- |
| `status`     | string  | `pending_otp`, `active`, `completed`, `cancelled` |
| `sort_by`    | string  | `created_at`, `booking_number`, `status`          |
| `sort_order` | string  | `asc`, `desc`                                     |
| `per_page`   | integer | 1–100, default 15                                 |

**Response `200`** — Paginated booking list (see [Booking Object](#booking-object)).

---

### POST `/patients/eligibility`

Check a patient's SHA coverage eligibility. Fetches/stores the patient from HIE if not already in the system.

**Request Body**

| Field                  | Type   | Required                              |
| ---------------------- | ------ | ------------------------------------- |
| `identificationType`   | string | Yes — same values as `POST /patients` |
| `identificationNumber` | string | Yes                                   |

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

| Field                   | Type   | Required | Notes                                          |
| ----------------------- | ------ | -------- | ---------------------------------------------- |
| `identification_type`   | string | Yes      | `Registration Number`, `License Number`        |
| `identification_number` | string | Yes      | The professional's registration/license number |
| `regulator`             | string | Yes      | e.g. `KMPDC`, `Nursing Council`                |
| `facility_id`           | uuid   | Yes      | Facility the professional is associated with   |

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

| Param      | Type    | Notes                                     |
| ---------- | ------- | ----------------------------------------- |
| `status`   | string  | `not_started`, `in_progress`, `completed` |
| `from`     | date    | `Y-m-d`                                   |
| `to`       | date    | `Y-m-d`                                   |
| `per_page` | integer | 1–100, default 15                         |

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

| Param             | Type   | Required | Default   | Notes                                      |
| ----------------- | ------ | -------- | --------- | ------------------------------------------ |
| `identifier`      | string | Yes      | —         | FR facility identifier value (min 3 chars) |
| `identifier-type` | string | No       | `fr-code` | e.g. `fr-code`, `hmis-code`                |

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

| Param                 | Type    | Notes                                      |
| --------------------- | ------- | ------------------------------------------ |
| `county`              | string  | County name filter                         |
| `keph_level`          | string  | Facility KEPH level (case-insensitive)     |
| `hmis`                | string  | HMIS code filter                           |
| `status`              | string  | `active`, `inactive`, `suspended`          |
| `sha_contract_status` | string  | `active`, `pending`, `inactive`, `expired` |
| `search`              | string  | Free-text search                           |
| `page`                | integer | Default 1                                  |
| `page_size`           | integer | 1–100, default 20                          |

**Response `200`** — Paginated facility list.

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Kenyatta National Hospital",
      "code": "KNH",
      "fr_code": "14062",
      "keph_level": "6",
      "facility_type": "National Referral Hospital",
      "facility_ownership": "Public",
      "sha_contract_status": "active",
      "phone_number": "+254202720300",
      "email": "info@knh.or.ke",
      "is_active": true,
      "county": { "id": "uuid", "name": "Nairobi", "code": "001" },
      "sub_county": { "id": "uuid", "name": "Westlands", "code": "001" },
      "ward": { "id": "uuid", "name": "Parklands", "code": "001" }
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 95,
    "from": 1,
    "to": 20
  }
}
```

---

### POST `/facilities`

Create a new facility. **Auth required.**

**Request Body**

| Field                 | Type    | Required | Notes                                                               |
| --------------------- | ------- | -------- | ------------------------------------------------------------------- |
| `id`                  | string  | Yes      | Facility identifier (FR code), max 50 chars                         |
| `name`                | string  | Yes      | Official name, max 255 chars                                        |
| `keph_level`          | integer | Yes      | 1–6                                                                 |
| `ownership`           | string  | Yes      | `public`, `private`, `faith_based`, `ngo`, `parastatal`, `military` |
| `county`              | string  | Yes      | Max 100 chars                                                       |
| `subcounty`           | string  | Yes      | Max 100 chars                                                       |
| `ward`                | string  | Yes      | Max 100 chars                                                       |
| `hmis`                | string  | Yes      | HMIS code, max 100 chars                                            |
| `callback_url`        | uri     | Yes      | EMR callback URL                                                    |
| `username`            | string  | No       | Facility system username                                            |
| `password`            | string  | No       | Facility system password                                            |
| `status`              | string  | No       | Default `active`                                                    |
| `sha_contract_status` | string  | No       | Default `pending`                                                   |

**Response `201`** — Facility created.

```json
{
  "message": "Facility created successfully.",
  "facility": {
    "id": "uuid",
    "name": "Kenyatta National Hospital",
    "code": "KNH",
    "fr_code": "14062",
    "keph_level": "6",
    "facility_type": "National Referral Hospital",
    "facility_ownership": "Public",
    "sha_contract_status": "active",
    "phone_number": "+254202720300",
    "email": "info@knh.or.ke",
    "is_active": true,
    "county": { "id": "uuid", "name": "Nairobi", "code": "001" },
    "sub_county": { "id": "uuid", "name": "Westlands", "code": "001" },
    "ward": { "id": "uuid", "name": "Parklands", "code": "001" },
    "facility_admin": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@knh.or.ke",
      "phone": "+254700000000",
      "role": "f_admin"
    }
  }
}
```

**Response `409`** — Facility already exists.

---

### GET `/facilities/{facility_id}`

Get a facility by ID.

**Response `200`** — Full facility object.

```json
{
  "data": {
    "id": "uuid",
    "name": "Kenyatta National Hospital",
    "code": "KNH",
    "fr_code": "14062",
    "keph_level": "6",
    "facility_type": "National Referral Hospital",
    "facility_ownership": "Public",
    "sha_contract_status": "active",
    "phone_number": "+254202720300",
    "email": "info@knh.or.ke",
    "is_active": true,
    "county": { "id": "uuid", "name": "Nairobi", "code": "001" },
    "sub_county": { "id": "uuid", "name": "Westlands", "code": "001" },
    "ward": { "id": "uuid", "name": "Parklands", "code": "001" },
    "created_at": "2025-05-01T09:00:00+03:00",
    "updated_at": "2025-05-01T09:00:00+03:00"
  }
}
```

**Response `404`** — Facility not found.

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

| Param             | Type    | Notes                           |
| ----------------- | ------- | ------------------------------- |
| `lifecycle_state` | string  | `active`, `disabled`, `retired` |
| `search`          | string  | Free-text search                |
| `page`            | integer | Default 1                       |
| `page_size`       | integer | 1–100, default 20               |

**Response `200`** — Paginated vendor list.

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Melco Kenya Ltd",
      "code": "VEN001",
      "email": "info@melco.co.ke",
      "phone": "+254700000000",
      "is_active": true,
      "created_at": "2025-05-01T09:00:00+03:00",
      "updated_at": "2025-05-01T09:00:00+03:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 20,
    "total": 45,
    "from": 1,
    "to": 20
  }
}
```

---

### POST `/vendors`

Create a new vendor. **Auth required.**

**Request Body**

| Field               | Type   | Required | Notes                             |
| ------------------- | ------ | -------- | --------------------------------- |
| `vendor_alpha_code` | string | Yes      | 3–10 chars, unique                |
| `dha_vendor_code`   | string | Yes      | DHA code, max 50 chars            |
| `sha_vendor_code`   | string | Yes      | SHA code, max 50 chars            |
| `name`              | string | Yes      | Max 255 chars                     |
| `description`       | string | No       |                                   |
| `address`           | string | No       |                                   |
| `country`           | string | No       | ISO 2-letter, default `KE`        |
| `email`             | string | No       |                                   |
| `phone`             | string | No       | Max 20 chars                      |
| `website`           | string | No       |                                   |
| `financial_details` | object | No       |                                   |
| `lifecycle_state`   | string | No       | Default `active`                  |
| `modality_ids`      | array  | No       | UUID array of modality references |

**Response `201`** — Vendor created.

```json
{
  "message": "Vendor created successfully.",
  "vendor": {
    "id": "uuid",
    "name": "Melco Kenya Ltd",
    "code": "VEN001",
    "email": "info@melco.co.ke",
    "phone": "+254700000000",
    "is_active": true,
    "created_at": "2025-05-01T09:00:00+03:00",
    "updated_at": "2025-05-01T09:00:00+03:00"
  },
  "admin": {
    "id": "uuid",
    "name": "Vendor Admin",
    "email": "admin@melco.co.ke",
    "phone": "+254711000000",
    "role": "vendor"
  }
}
```

**Response `409`** — Vendor code already exists.

---

### GET `/vendors/{vendor_id}`

Get vendor by ID. Includes contacts and equipment count.

**Response `200`**

```json
{
  "data": {
    "id": "uuid",
    "name": "Melco Kenya Ltd",
    "code": "VEN001",
    "email": "info@melco.co.ke",
    "phone": "+254700000000",
    "is_active": true,
    "address": "Nairobi, Kenya",
    "contacts": [
      { "name": "John Doe", "phone": "+254700000001", "email": "john@melco.co.ke", "role": "technical" }
    ],
    "equipment_count": 6,
    "created_at": "2025-05-01T09:00:00+03:00",
    "updated_at": "2025-05-01T09:00:00+03:00"
  }
}
```

**Response `404`** — Vendor not found.

---

### PUT `/vendors/{vendor_id}`

Update vendor. All fields optional. Returns updated vendor object.

---

### DELETE `/vendors/{vendor_id}`

Soft-delete (mark as `retired`). Returns `204`.

---

### Vendor Bookings & Dashboard

#### GET `/vendors/{vendor}/bookings`

List bookings for all equipment belonging to the vendor.

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "booking": {
        "id": "uuid",
        "booking_number": "BK-2025-00042",
        "status": "completed",
        "source": "standalone",
        "created_at": "2025-05-01T09:00:00+03:00"
      },
      "patient": { "name": "John Kamau" },
      "facility": { "name": "Kenyatta National Hospital" },
      "lot": { "number": "1", "name": "Diagnostics Imaging X-ray" },
      "service": { "code": "XRAY-CHEST-PA", "name": "Chest X-Ray PA" },
      "equipment": { "code": "XRAY-001", "serial_number": "SN-12345", "name": "GE Discovery XR656" },
      "scheduled_date": "2025-06-01",
      "status": "completed",
      "tariff": 3500.00,
      "payment": { "sha": 3000.00, "cash": 500.00, "other_insurance": 0.00 },
      "revenue": { "vendor_share": 2100.00, "facility_share": 1400.00 },
      "started_at": "2025-06-01T09:30:00+03:00",
      "completed_at": "2025-06-01T10:00:00+03:00",
      "notes": null
    }
  ],
  "summary": {
    "total_services": 156,
    "total_bookings": 42,
    "unique_patients": 38,
    "by_service_status": { "not_started": 10, "completed": 140, "cancelled": 6 },
    "revenue": {
      "tariff": "546000.00",
      "vendor_share": "327600.00",
      "facility_share": "218400.00",
      "sha": "400000.00",
      "cash": "100000.00",
      "other_insurance": "46000.00"
    }
  },
  "pagination": {
    "current_page": 1,
    "last_page": 8,
    "per_page": 20,
    "total": 156,
    "from": 1,
    "to": 20
  }
}
```

#### GET `/vendors/{vendor}/dashboard`

Get vendor-specific dashboard with equipment counts, booking stats, and revenue summaries.

This is the admin's view of one vendor, and it does not carry a booking series.
Trends live on the three dashboards the portals themselves use, in one shared
shape — see [`GET /facility/dashboard`](#get-facilitydashboard).

**Query Parameters**

| Param            | Type   | Notes |
| ---------------- | ------ | ----- |
| `facility_id`    | uuid   | Only bookings at this facility |
| `keph_level`     | string | Only bookings at facilities of this KEPH level (case-insensitive) |
| `source`         | string | `provider_portal`, `hmis`, `standalone` |
| `revenue_type`   | string | `cash`, `sha`, `other_insurance` |
| `from` / `to`    | date   | `Y-m-d`; default: last 30 days |
| `trend_grouping` | string | `day`, `week`, `month`, `year` |

**Response `200`**

```json
{
  "data": {
    "vendor": { "id": "uuid", "name": "Melco Kenya Ltd", "code": "VEN001" },
    "period": { "from": "2026-01-01", "to": "2026-08-04" },
    "equipment": {
      "total": 6,
      "by_status": { "active": 4, "maintenance": 1, "decommissioned": 0, "pending": 1 }
    },
    "bookings": {
      "total_bookings": 42,
      "total_services": 156,
      "by_service_status": { "not_started": 10, "completed": 140, "cancelled": 6 },
      "by_source": { "standalone": 60, "hmis": 40, "provider_portal": 56 }
    },
    "revenue": {
      "tariff": "546000.00",
      "vendor_share": "327600.00",
      "facility_share": "218400.00",
      "by_payment_type": { "sha": "400000.00", "cash": "100000.00", "other_insurance": "46000.00" }
    },
    "patients": { "unique_count": 38 },
    "facilities": {
      "count": 5,
      "list": [{ "id": "uuid", "name": "Kenyatta National Hospital", "fr_code": "14062" }]
    },
    "lots": {
      "count": 3,
      "list": [{ "id": "uuid", "number": "1", "name": "Diagnostics Imaging X-ray" }]
    },
    "services": {
      "count": 12,
      "list": [{ "id": "uuid", "code": "XRAY-CHEST-PA", "name": "Chest X-Ray PA" }]
    },
    "trendline": {
      "grouping": "monthly",
      "data": [
        {
          "period": "2026-07",
          "sha": "50000.00",
          "cash": "12500.00",
          "other_insurance": "5000.00",
          "vendor_share": "41250.00",
          "total": "67500.00",
          "services_count": 20
        }
      ]
    }
  }
}
```

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

| Value                    | Description            |
| ------------------------ | ---------------------- |
| `xray_digital`           | Digital X-Ray          |
| `xray_mobile`            | Mobile X-Ray           |
| `xray_portable`          | Portable X-Ray         |
| `fluoroscopy`            | Fluoroscopy            |
| `c_arm`                  | C-Arm                  |
| `ultrasound_general`     | General Ultrasound     |
| `ultrasound_3d_4d`       | 3D/4D Ultrasound       |
| `ultrasound_portable`    | Portable Ultrasound    |
| `doppler`                | Doppler                |
| `mammography_digital`    | Digital Mammography    |
| `mammography_3d`         | 3D Mammography         |
| `ct_scanner`             | CT Scanner             |
| `ct_scanner_multi_slice` | Multi-Slice CT Scanner |
| `mri_scanner`            | MRI Scanner            |
| `mri_open`               | Open MRI               |
| `linear_accelerator`     | Linear Accelerator     |
| `brachytherapy`          | Brachytherapy          |
| `cobalt_60`              | Cobalt-60              |
| `treatment_planning`     | Treatment Planning     |
| `simulator`              | Simulator              |
| `gamma_camera`           | Gamma Camera           |
| `spect`                  | SPECT                  |
| `pet_scanner`            | PET Scanner            |
| `pet_ct`                 | PET-CT                 |
| `cyclotron`              | Cyclotron              |
| `angiography`            | Angiography            |
| `cath_lab`               | Cath Lab               |
| `dsa`                    | DSA                    |
| `ecg`                    | ECG                    |
| `echocardiography`       | Echocardiography       |
| `holter_monitor`         | Holter Monitor         |
| `stress_test`            | Stress Test            |
| `pacemaker_programmer`   | Pacemaker Programmer   |
| `tmt`                    | TMT                    |
| `anesthesia_machine`     | Anesthesia Machine     |

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

| Field              | Type    | Required | Notes                                                                      |
| ------------------ | ------- | -------- | -------------------------------------------------------------------------- |
| `name`             | string  | Yes      | Max 255 chars                                                              |
| `category`         | string  | Yes      | See category values above                                                  |
| `serial_number`    | string  | No       | Must be unique, max 100 chars                                              |
| `model`            | string  | No       | Max 100 chars                                                              |
| `brand`            | string  | No       | Max 100 chars                                                              |
| `manufacture_date` | date    | No       |                                                                            |
| `description`      | string  | No       | Max 1000 chars                                                             |
| `specifications`   | object  | No       | Free-form JSON key/value                                                   |
| `status`           | string  | No       | Defaults to `pending_installation`. See status values above.               |
| `ae_title`         | string  | No       | DICOM AE Title — alphanumeric + underscore, max 16 chars. Auto-uppercased. |
| `hl7_host`         | string  | No       | IP address or hostname of the physical device                              |
| `hl7_port`         | integer | No       | 1–65535                                                                    |
| `dicom_port`       | integer | No       | 1–65535                                                                    |

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

Set or update DICOM connection details (AE title, IP, port) and register with Orthanc in one step. Also supports assigning a vendor and/or facility during configuration — this is how a discovered, pending-installation device is claimed.

**Request Body**

| Field         | Type    | Required | Notes                                         |
| ------------- | ------- | -------- | --------------------------------------------- |
| `ae_title`    | string  | Yes      | DICOM AE title, max 16 chars, auto-uppercased |
| `ip`          | string  | Yes      | IP address or hostname of the physical device |
| `port`        | integer | Yes      | DICOM port, 1–65535                           |
| `vendor_id`   | string  | No       | UUID of the vendor to assign                  |
| `facility_id` | string  | No       | UUID of the facility to assign                |

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

Auto-discovers a DICOM device. Unknown devices are created **unowned and `pending_installation`** — they are not attached to a placeholder vendor. An admin later assigns a vendor and/or facility (see `POST /dicom/equipment/{equipment}/configure`).

Every call is also written to the device activity log as a `worklist_pull`.

**Request Body**

| Field         | Type    | Required | Notes                                         |
| ------------- | ------- | -------- | --------------------------------------------- |
| `ae_title`    | string  | Yes      | DICOM AE Title, max 16 chars                  |
| `remote_ip`   | string  | No       | IP address of the connecting device           |
| `remote_port` | integer | No       | The device's **listening** DICOM port — never the ephemeral TCP source port of the connection |

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
    "vendor": null
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

> When a known device reconnects, `reported_ip` and `last_seen_at` are updated. `hl7_host` is moved only when the address is that machine's own — admin-set values (vendor, ports, etc.) are **never** overwritten.

---

## 7. Equipment

Equipment management is done through vendor-nested routes (`/vendors/{vendor}/equipments`) and the admin equipment section (`/admin/equipment`). The following endpoints provide additional equipment-level operations.

### GET `/equipment/{equipment}`

Get a single equipment with full details. **Auth required** (admin/nesp/moh/cog).

### GET `/equipment/facility/{facility}/operational`

Get all operational equipment at a facility. **Auth required** (admin/nesp/moh/cog).

### POST `/equipment/{equipment}/publish-orthanc`

Republish a single equipment modality entry to Orthanc. **Auth required** (admin/nesp/moh/cog).

### POST `/equipment/sync-dicom-aet`

Populate missing `dicom_aet` from `asset_id` when possible and normalize identifier casing. **Auth required** (admin/nesp/moh/cog).

---

### Equipment Ping Requests

#### POST `/equipment/ping-requests`

Capture a machine ping/storage/test-connection event for approval review. **Public** (no auth).

| Field                  | Type    | Required | Notes                      |
| ---------------------- | ------- | -------- | -------------------------- |
| `ae_title`             | string  | Yes      | DICOM AE title, 1–64 chars |
| `ip_addr`              | string  | Yes      | IP address, 1–64 chars     |
| `port`                 | integer | Yes      | 1–65535                    |
| `request_type`         | string  | No       | Default `ping`             |
| `modality`             | string  | No       | Max 32 chars               |
| `device_name_ae_title` | string  | No       | Max 16 chars               |
| `machine_features`     | object  | No       |                            |
| `payload`              | object  | No       |                            |
| `equipment_id`         | uuid    | No       | Link to known equipment    |

**Response `201`** — Ping request captured.

#### GET `/equipment/ping-requests/activity`

Every inbound device event, in arrival order — the running log behind the ping
requests screen. Records the **bare name the device sent**, plus a best-effort
link to known equipment. Nothing is enriched or created on the way in.

| Param           | Type    | Notes                                                        |
| --------------- | ------- | ------------------------------------------------------------ |
| `activity_type` | string  | `connect`, `worklist_pull` or `study_send`                    |
| `source_name`   | string  | Partial match on the name the device sent                     |
| `equipment_id`  | uuid    | Only events linked to this equipment                          |
| `facility_id`   | uuid    | Only events on this facility's machines                       |
| `keph_level`    | string  | Only events at facilities of this KEPH level (case-insensitive) |
| `vendor_id`     | uuid    | Only events on machines owned by this vendor                  |
| `linked`        | boolean | `true` for linked events only, `false` for unlinked only      |
| `period`        | string  | `7d`, `30d`, `90d`, `12m`, `this_month`, `this_year`          |
| `from` / `to`   | date    | Explicit range; overrides `period`                            |
| `page_size`     | integer | 1–100, default 50                                             |

`summary` describes the **filtered** set the rows came from, not the whole
table, so the counters move with the screen's controls. `devices` counts a
machine once however it announced itself: a linked event counts as its
equipment, an unlinked one as the name it sent, and the two are deduplicated
together. `by_type` lists every activity type, including the ones nothing
arrived as, so a legend does not change shape as traffic changes.

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "activity_type": "worklist_pull",
      "source_name": "XRDFAC01",
      "device_name": null,
      "ip_addr": "10.0.0.9",
      "port": 11112,
      "modality": null,
      "equipment": { "id": "uuid", "code": "FID224094115 DX", "name": "Digital X-Ray Unit" },
      "facility": { "id": "uuid", "name": "Kenyatta National Hospital", "fr_code": "FID-22-109411-5" },
      "context": { "discovered": false },
      "occurred_at": "2026-09-24T09:30:45+03:00"
    }
  ],
  "pagination": { "current_page": 1, "per_page": 50, "total": 248, "total_pages": 5 },
  "summary": {
    "total": 248,
    "linked": 231,
    "unlinked": 17,
    "devices": 12,
    "latest_at": "2026-09-24T09:30:45+03:00",
    "by_type": [
      { "value": "connect", "label": "Connect", "count": 96 },
      { "value": "worklist_pull", "label": "Worklist Pull", "count": 88 },
      { "value": "study_send", "label": "Study Send", "count": 64 }
    ]
  },
  "available_filters": {
    "activity_type": [{ "value": "connect", "label": "Connect" }],
    "linked": [
      { "value": "true", "label": "Known device" },
      { "value": "false", "label": "Unknown device" }
    ],
    "period": [{ "value": "7d", "label": "Last 7 Days" }]
  }
}
```

The same log is served at `GET /dicom/events/ping-events` for backward compatibility.

#### GET `/equipment/ping-requests/pending-installation`

Equipment awaiting installation — typically devices discovered on the network
that have not been assigned a vendor or facility yet.

| Param             | Type    | Notes                                              |
| ----------------- | ------- | -------------------------------------------------- |
| `unassigned_only` | boolean | Only equipment with no vendor **and** no facility  |
| `page_size`       | integer | 1–100, default 50                                  |

Each row carries `discovered.ip` / `discovered.port` from the discovery payload
so an admin can recognise the device.

#### GET `/equipment/ping-requests/pending`

List pending ping requests waiting for approval. **Auth required** (admin/nesp/moh/cog).

#### GET `/equipment/ping-requests/realtime`

Realtime polling endpoint for the approval queue. **Auth required** (admin/nesp/moh/cog).

| Param   | Type     | Notes                                     |
| ------- | -------- | ----------------------------------------- |
| `since` | datetime | Return requests seen since this timestamp |

#### GET `/equipment/ping-requests/linked-equipment-ids`

Return distinct equipment IDs already referenced by any ping request. **Auth required** (admin/nesp/moh/cog).

#### POST `/equipment/ping-requests/{id}/approve`

Approve a pending machine ping request. **Auth required** (admin/nesp/moh/cog).

| Field               | Type   | Required | Notes                                        |
| ------------------- | ------ | -------- | -------------------------------------------- |
| `approval_reason`   | string | No       |                                              |
| `equipment_id`      | uuid   | No       | Link to equipment                            |
| `ae_title_source`   | string | No       | `machine_ping`, `system_generated`, `custom` |
| `selected_ae_title` | string | No       | Custom AE title                              |

#### POST `/equipment/ping-requests/{id}/reject`

Reject a pending machine ping request. Same body as approve. **Auth required** (admin/nesp/moh/cog).

---

### Facility Portal — Equipment

Facility users see two kinds of equipment, both resolved from the authenticated
user's profile — no facility identifier is accepted, and equipment belonging to
other facilities is never returned:

- **`facility`** — units the facility owns (`equipment.facility_id`).
- **`vendor`** — units a vendor has mapped to the facility through a contract
  service on one of the facility's active, current contracts.

Listing and detail are available to `f_admin`, `f_finance`, `f_practitioner`,
`f_equipment_user` and `f_view_only`. Adding equipment is **`f_admin` only**.

#### GET `/facility/dashboard`

The facility dashboard: equipment, studies, services, revenue and bookings, all
scoped to the facility resolved from the caller's profile.

Counts the same equipment population as the facility equipment listings — the
units the facility owns **plus** the vendor units mapped to it through an active
contract service.

**Query Parameters**

| Param   | Type   | Notes                                                                     |
| ------- | ------ | ------------------------------------------------------------------------- |
| `trend` | string | `daily` (last 30 days, default) or `monthly` (last 12 months)              |

Alongside the counters the response carries `booking_trend` and `trend_options`
in the same shape as the [admin dashboard](#21-admin-dashboard--analytics):

```json
"booking_trend": {
  "granularity": "daily",
  "buckets": 30,
  "total": 42,
  "points": [{ "bucket": "2026-08-26", "label": "26 Aug", "count": 3 }]
},
"trend_options": [
  { "value": "daily", "label": "Daily (30 days)" },
  { "value": "monthly", "label": "Monthly (12 months)" }
]
```

The series counts **bookings made at this facility**. Buckets are oldest first
and every bucket is present whether or not anything happened in it, so the chart
is drawn from the response without filling gaps. `GET /vendor/dashboard` answers
with the same two fields, counting bookings on that vendor's machines wherever
they stand — one chart component serves all three dashboards.

**Response `200`**

```json
{
  "data": {
    "facility": { "id": "uuid", "name": "Kenyatta National Hospital", "fr_code": "FID-22-109411-5" },
    "equipment": {
      "total": 24,
      "by_status": { "active": 20, "maintenance": 2, "down": 1, "pending_installation": 1 },
      "by_connectivity": { "live": 3, "linked": 12, "never_connected": 12, "total": 24 }
    },
    "studies": {
      "total": 180,
      "active": 4,
      "completed": 172,
      "cancelled": 4,
      "with_result": 169,
      "awaiting_result": 3,
      "average_turnaround_minutes": 12.4
    },
    "services": {
      "total": 190,
      "completed": 175,
      "not_started": 10,
      "cancelled": 5,
      "completion_rate": 94.6
    },
    "revenue": {
      "tariff": "285000.00",
      "facility_share": "57000.00",
      "vendor_share": "228000.00"
    },
    "bookings": {
      "total": 96,
      "this_month": 14,
      "by_status": { "pending_otp": 2, "active": 4, "completed": 86, "cancelled": 4 },
      "patients": 61
    }
  }
}
```

| Card | Notes |
| ---- | ----- |
| `equipment` | `by_status` always carries every status, including the ones nothing is sitting in |
| `studies` | Worklists raised for this facility. `active` = `pending`/`sent`/`in_progress`; `with_result` = the report came back; `awaiting_result` = still outstanding |
| `studies.average_turnaround_minutes` | Minutes from the worklist being published (`sent_at`) to the result arriving. `null` until at least one study has completed the round trip |
| `services` | Booked services on this facility's contracts. `completion_rate` = completed ÷ (total − cancelled), so abandoned bookings do not drag it down |
| `revenue` | Summed over all of the facility's booked services, decimal strings |
| `bookings` | Bookings raised at the facility, with `patients` as the distinct patient count |

Vendor smoke-test worklists (`is_test`) are excluded from `studies`, so running
a probe never moves an operational figure.

`by_connectivity` is the shared connectivity card — see
[the admin dashboard](#21-admin-dashboard--analytics) for the field meanings.
`live` is a subset of `linked`; `linked + never_connected` is the total.

**Response `403`** — Caller is not linked to a facility.

#### GET `/facility/equipments`

List the caller's facility equipment with filters, a status summary, and the
filter options for dropdowns.

| Param          | Type    | Notes                                                                       |
| -------------- | ------- | --------------------------------------------------------------------------- |
| `search`       | string  | Matches name, code, AE title, serial number, model, brand                     |
| `modality`     | string  | DICOM modality code (e.g. `DX`), or `non_imaging`                            |
| `category`     | string  | `EquipmentCategory` value                                                    |
| `status`       | string  | `EquipmentStatus` value                                                      |
| `is_connected` | boolean |                                                                              |
| `linked`       | boolean | `true` = seen on the network, `false` = never seen                            |
| `ownership_type` | string | `facility` or `vendor` — omit to get both                                    |
| `sort_by`      | string  | `name`\|`code`\|`category`\|`status`\|`created_at`\|`last_seen_at` (default `name`) |
| `sort_order`   | string  | `asc`\|`desc` (default `asc`)                                                 |
| `per_page`     | integer | 1–100, default 20                                                            |
| `page`         | integer | Default 1                                                                    |

**Response `200`**

```json
{
  "summary": { "active": 2, "maintenance": 1, "total": 3 },
  "data": [
    {
      "id": "uuid",
      "ownership_type": "facility",
      "code": "FID224094115 DX",
      "name": "Digital X-Ray Unit",
      "serial_number": "SN-0001",
      "model": "Model-AX01",
      "brand": "Siemens",
      "category": "xray_digital",
      "category_label": "Digital X-Ray",
      "modality": "DX",
      "status": "active",
      "status_label": "Active",
      "status_color": "green",
      "is_operational": true,
      "ae_title": "XRD01",
      "is_connected": true,
      "linked": true,
      "last_seen_at": "2025-01-01T09:00:00+03:00",
      "vendor": { "id": "uuid", "code": "VEN-01", "name": "Acme Medical" },
      "mapped_services_count": 2,
      "mapped_services": [
        {
          "contract_service_id": "uuid",
          "contract_id": "uuid",
          "lot_service_id": "uuid",
          "code": "SHA-09-074",
          "name": "Chest X-Ray (PA)",
          "tariff": "1500.00",
          "is_active": true,
          "lot": { "id": "uuid", "number": "1", "name": "Diagnostics Imaging X-ray" }
        }
      ]
    }
  ],
  "pagination": { "current_page": 1, "per_page": 20, "total": 3, "total_pages": 1 },
  "available_filters": {
    "status": [{ "value": "active", "label": "Active" }],
    "category": [{ "value": "xray_digital", "label": "Digital X-Ray" }],
    "modality": [{ "code": "DX", "label": "DX" }],
    "sort_by": [{ "value": "name", "label": "Name" }],
    "sort_order": [{ "value": "asc", "label": "Ascending" }]
  }
}
```

**Response `403`** — Caller is not linked to a facility.

#### GET `/facility/equipments/{equipment_id}`

Equipment detail page payload — identity, technical specifications, operational
status, downtime, DICOM/connectivity block, owning facility and vendor, and the
ten most recent status changes.

**Response `200`**

```json
{
  "data": {
    "id": "uuid",
    "ownership_type": "facility",
    "code": "FID224094115 DX",
    "name": "Digital X-Ray Unit",
    "serial_number": "SN-0001",
    "model": "Model-AX01",
    "brand": "Siemens",
    "description": "General radiography room.",
    "specifications": { "generator": "50 kW" },
    "category": "xray_digital",
    "category_label": "Digital X-Ray",
    "modality": "DX",
    "status": "maintenance",
    "status_label": "Under Maintenance",
    "status_color": "yellow",
    "is_operational": false,
    "is_currently_down": true,
    "active_downtime": {
      "id": "uuid",
      "started_at": "2025-01-01T06:00:00+03:00",
      "reason": "Detector fault",
      "notes": "Awaiting vendor part"
    },
    "total_downtime_minutes": 180,
    "ae_title": "XRD01",
    "dicom": {
      "ae_title": "XRD01",
      "calling_ae_title": "VEMS",
      "host": "10.0.0.12",
      "dicom_port": 11112,
      "hl7_port": 2575,
      "is_connected": true,
      "linked": true,
      "last_seen_at": "2025-01-01T09:00:00+03:00",
      "connected_at": "2024-11-02T08:00:00+03:00"
    },
    "facility": {
      "id": "uuid",
      "name": "Kenyatta National Hospital",
      "code": "KNH",
      "fr_code": "FID-22-109411-5"
    },
    "vendor": { "id": "uuid", "code": "VEN-01", "name": "Acme Medical" },
    "manufacture_date": "2023-05-01",
    "mapped_services_count": 1,
    "mapped_services": [
      {
        "contract_service_id": "uuid",
        "contract_id": "uuid",
        "lot_service_id": "uuid",
        "code": "SHA-09-074",
        "name": "Chest X-Ray (PA)",
        "tariff": "1500.00",
        "is_active": true,
        "lot": { "id": "uuid", "number": "1", "name": "Diagnostics Imaging X-ray" }
      }
    ],
    "status_history": [
      {
        "id": "uuid",
        "status": "down",
        "started_at": "2025-01-01T06:00:00+03:00",
        "ended_at": null,
        "downtime_minutes": null,
        "formatted_downtime": "3 hours",
        "reason": "Detector fault",
        "notes": "Awaiting vendor part"
      }
    ],
    "created_at": "2025-01-01T00:00:00+03:00",
    "updated_at": "2025-01-01T00:00:00+03:00"
  }
}
```

**Response `403`** — Caller is not linked to a facility.
**Response `404`** — Equipment not found, or not visible to the facility.

> Every equipment detail payload — this one, `GET /vendor/equipments/{equipment}`,
> `GET /vendors/{vendor}/equipments/{equipment}` and
> `GET /admin/equipment/{equipment}` — carries the same `worklist_tests`
> component. See [Equipment testing component](#equipment-testing-component).

#### POST `/facility/equipments`

Register a facility-owned unit by copying equipment already mapped to the
facility. Supply the `contract_service_id` of any service the existing unit
provides; everything else (name, model, brand, category, specifications) is
copied from it, the services that unit offers **in the same lot** are mapped to
the new unit automatically, and the vendor's own mapping is left untouched.

**`f_admin` only.**

| Field                 | Type   | Required | Notes                                                        |
| --------------------- | ------ | -------- | ------------------------------------------------------------ |
| `contract_service_id` | uuid   | Yes      | A service on one of the facility's active, current contracts  |
| `ae_title`            | string | Yes      | Max 64 chars; stored upper-cased                              |
| `name`                | string | No       | Defaults to the source unit's name                            |
| `serial_number`       | string | No       | Must be unique; left `null` when omitted                      |

The new unit gets a facility-style code (`FR-code` + modality) from the source
category, suffixed when the facility already has a unit of that modality.

**Response `201`** — the new equipment, in the same shape as the detail
endpoint, with `mapped_services` listing what was mapped to it.

**Response `403`** — Caller is not linked to a facility.
**Response `404`** — Service not found on an active contract for the facility.
**Response `422`** — Validation failed, or the service has no equipment to copy.

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

**Response `200`**

```json
{
  "data": [
    {
      "ae_title": "GEXR001",
      "equipment": {
        "id": "uuid",
        "code": "XRAY-001",
        "name": "GE Discovery XR656",
        "category": "xray_digital",
        "category_label": "Digital X-Ray",
        "modality": "DX",
        "status": "active",
        "status_label": "Active"
      },
      "network": { "ip": "192.168.1.50", "port": 11112 },
      "vendor": { "id": "uuid", "name": "Melco Kenya Ltd", "code": "VEN001" },
      "facility": { "id": "uuid", "name": "Kenyatta National Hospital", "fr_code": "14062" },
      "is_connected": true,
      "last_seen_at": "2025-05-01T10:30:00+03:00"
    }
  ]
}
```

---

### POST `/dicom/modalities/register-all`

Bulk-register all equipment with DICOM config as Orthanc modalities.

**Response `200`**

```json
{
  "total": 15,
  "results": [
    { "ae_title": "GEXR001", "status": "registered" },
    { "ae_title": "SOMATOM02", "status": "failed", "error": "Connection refused" }
  ]
}
```

---

### POST `/dicom/equipment/{equipment}/configure`

Set or update DICOM connection details (AE title, IP, port) and register with Orthanc in one step. Also supports assigning a vendor and/or facility during configuration — this is how a discovered, pending-installation device is claimed.

**Request Body**

| Field         | Type    | Required | Notes                                         |
| ------------- | ------- | -------- | --------------------------------------------- |
| `ae_title`    | string  | Yes      | DICOM AE title, max 16 chars, auto-uppercased |
| `ip`          | string  | Yes      | IP address or hostname of the physical device |
| `port`        | integer | Yes      | DICOM port, 1–65535                           |
| `vendor_id`   | string  | No       | UUID of the vendor to assign                  |
| `facility_id` | string  | No       | UUID of the facility to assign                |

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

**Response `200`**

```json
{
  "equipment_id": "uuid",
  "ae_title": "GEXR001",
  "host": "192.168.1.50",
  "dicom_port": 11112,
  "registered": true,
  "echo_success": true,
  "is_connected": true,
  "message": "C-ECHO successful — device is online."
}
```

**Response `422`** — Equipment not configured (no AE title or host).

**Response `503`** — Orthanc server unreachable.

---

### POST `/dicom/equipment/{equipment}/register`

Register equipment as a DICOM modality in Orthanc.

**Response `200`**

```json
{
  "equipment_id": "uuid",
  "ae_title": "GEXR001",
  "registered": true,
  "message": "Equipment registered as DICOM modality in Orthanc."
}
```

**Response `422`** — Equipment missing AE title or host.

**Response `502`** — Orthanc registration failed.

---

### DELETE `/dicom/equipment/{equipment}/register`

Unregister equipment from Orthanc modalities.

---

### GET `/dicom/equipment/{equipment}/status`

Get equipment DICOM connectivity status (last seen, connected state).

**Response `200`**

```json
{
  "equipment_id": "uuid",
  "name": "GE Discovery XR656",
  "serial_number": "SN-12345",
  "ae_title": "GEXR001",
  "host": "192.168.1.50",
  "dicom_port": 11112,
  "registered_in_orthanc": true,
  "is_connected": true,
  "last_seen_at": "2025-05-01T10:30:00+03:00",
  "connected_at": "2025-05-01T08:00:00+03:00",
  "vendor_config": {
    "mwl_server_ip": "10.0.0.1",
    "mwl_server_port": 4242,
    "mwl_server_aet": "VEMSSCP",
    "equipment_aet": "GEXR001",
    "connection_type": "DICOM C-FIND Worklist (MWL)"
  }
}
```

---

### POST `/dicom/discovered`

> **Internal endpoint** — called automatically by Orthanc's `on-cfind-discovery.lua` when an unrecognized device sends a C-FIND or MWL request.

Auto-discovers a DICOM device. Unknown devices are created **unowned and `pending_installation`**, and recorded in the device activity log as a `worklist_pull`.

**Request Body**

| Field         | Type    | Required | Notes                                         |
| ------------- | ------- | -------- | --------------------------------------------- |
| `ae_title`    | string  | Yes      | DICOM AE Title, max 16 chars                  |
| `remote_ip`   | string  | No       | IP address of the connecting device           |
| `remote_port` | integer | No       | The device's **listening** DICOM port — never the ephemeral TCP source port of the connection |

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
    "vendor": null
  }
}
```

**Response `200`** — Subsequent connections (device already known by AE title)

---

### POST `/dicom/orthanc/started`

> **Internal endpoint** — called by Orthanc's `on-start.lua` to re-sync modalities after Orthanc restart.

---

### POST `/dicom/equipment/heartbeat`

> **Internal endpoint** — called by Orthanc's Lua scripts when equipment sends a periodic heartbeat/ping. Refreshes the device's address, connectivity timestamp (`last_seen_at`) and marks it as connected.

The address is refreshed on **every** heartbeat, including for equipment that is
still `pending_installation` — a device that has never been claimed still gets
its IP/port captured, so it can be C-ECHO'd once it is.

**Request Body**

| Field         | Type    | Required | Notes                                                                   |
| ------------- | ------- | -------- | ----------------------------------------------------------------------- |
| `ae_title`    | string  | Yes      | DICOM AE Title of the equipment                                         |
| `remote_ip`   | string  | No       | Device IP — always written to `reported_ip`, and to `hl7_host` when no other machine reports it |
| `remote_port` | integer | No       | Device's **listening** DICOM port — written to `dicom_port`/`hl7_port`   |

Omitted values are never written, so a bare heartbeat cannot blank an address
that is already configured. The same capture happens on `POST /dicom/discovered`
(for known devices), and on MPPS / C-STORE / result callbacks that report a
`station_ae_title` together with `remote_ip` / `remote_port`.

**A port is only ever filled when it is missing.** The host is refreshed whenever
it is observed (devices move), but a port is never replaced, because the value
arriving here was read back from Orthanc — which stored it from this same column
in the first place. Writing it blindly could only echo a stale value or stamp the
`11112` placeholder. To change a port on purpose use
`POST /dicom/equipment/{equipment}/configure`.

**An address is only adopted when it is that machine's own.** The address a
machine reports from is written to `reported_ip` on every contact, and to
`hl7_host` — the address a C-ECHO uses — only when no other machine reports the
same one. Behind NAT every machine at a site reports the site's address, and
storing that as a device's host would point its C-ECHO at the hospital boundary
and could overwrite a working LAN address. Being seen still counts:
`last_seen_at`, `is_connected` and `linked` all update regardless. The audit
below reports a shared address as `shared address (+N)`.

**Repairing existing addresses:**

```bash
# Which devices can't be pinged, and why (exit code 1 when any need attention)
php artisan vems:audit-modality-addresses

# One device only
php artisan vems:audit-modality-addresses --aet=XRD01

# Fill missing host/port from Orthanc's own modality config (never overwrites)
php artisan vems:audit-modality-addresses --from-orthanc

# Re-push the stored address to Orthanc, clearing drift
php artisan vems:audit-modality-addresses --register

# Totals only — no per-device table (what the scheduler runs)
php artisan vems:audit-modality-addresses --from-orthanc --summary
```

This also runs as a background service: the scheduler executes
`vems:audit-modality-addresses --from-orthanc --summary` daily at 03:00, so any
address Orthanc knows about is pulled into the equipment table without operator
involvement. Daily log volume is a handful of lines; run the command by hand
(without `--summary`) when you need the per-device table.

Findings are `missing ip`, `missing port`, `default port` (the `11112`
placeholder), `not in orthanc`, `host drift`, `port drift` and
`shared address (+N)` — the last meaning the address is reported by other
machines too, so it is the site's router rather than the device's, and a C-ECHO
to it stops at the boundary. A missing or wrong port cannot be discovered
automatically — a DICOM association never advertises the peer's listening port —
so those need `configure` once per device.

**Provisioning never fakes an address.** `vems:setup-imaging`,
`provision:facility` and `contracts:generate-all` create equipment with
`hl7_host` left `null`, because the address belongs to the device and is only
learned from its own traffic. They consequently skip Orthanc registration for
those rows until the device checks in — that is expected, not a failure.
`SyncOrthancModalitiesJob` and `CheckEquipmentConnectivity` also ignore
equipment without a host.

**Response `200`** — Heartbeat recorded.

```json
{
  "status": "ok",
  "ae_title": "GEXR001"
}
```

`status` is `unknown_ae` when no equipment matches the AE title.

---

### DICOM Callbacks (Internal)

#### POST `/dicom/callback/result`

Called by Orthanc Lua/Python plugin when a DICOM C-STORE result is received.

Besides the result itself, the study metadata below is persisted on the
worklist. **Pixel data is never stored** — only descriptors *about* the image
(dimensions, bit depth, windowing), so the study detail page can show what the
image was without any patient images being retained.

| Field                                                | Notes                                             |
| ---------------------------------------------------- | ------------------------------------------------- |
| `study_instance_uid`, `series_instance_uid`          | DICOM UIDs                                        |
| `study_date`, `study_time`                           | Study start date and time (`study_start_date` / `study_start_time` also accepted). Judged before it is stored — see below |
| `performed_date`, `performed_time`                   | `PerformedProcedureStepStartDate`/`Time` → `performed_at`. When the study was actually acquired, which is not always the same day as `StudyDate` |
| `series_count`, `instance_count`                     | Study extent. A single instance cannot know these, so when they are absent or `0` the counts are read back from Orthanc |
| `institution_name`                                   | Where the study was performed                     |
| `manufacturer`, `station_name`                       | Who made the machine, and the station that reported it |
| `body_part`                                          | `body_part_examined` also accepted                |
| `technologist`, `referring_physician`                | Stored as `performing_technologist` and `interpreting_physician` |
| `pixel_metadata.rows` / `.columns`                   | Image dimensions                                  |
| `pixel_metadata.bits_allocated` / `.bits_stored`      | Bit depth                                         |
| `pixel_metadata.window_center` / `.window_width`      | Windowing                                         |
| `pixel_metadata.*`                                   | Also `samples_per_pixel`, `photometric_interpretation`, `high_bit`, `pixel_representation`, `rescale_slope`, `rescale_intercept`, `pixel_spacing`, `slice_thickness`, `frame_count` |

Pixel descriptors may be nested under `pixel_metadata` / `image_metadata`, or
sent flat at the top level. Any key outside the list above is ignored, so a
payload carrying `PixelData` stores no pixels.

`series_count` / `instance_count` are resolved from Orthanc when the callback
cannot supply them, because a DICOM instance carries no series or instance count
of its own. An unreachable Orthanc leaves them unset rather than recording a
zero.

Those counts are read from a study that is still arriving, so a multi-series study
records what had arrived by then. The [settled callback](#post-dicomcallbackstudy-settled)
re-reads the study once it is complete and replaces them with the real ones.

Two things stop that resolution, and both are logged rather than left to be
discovered later: a callback with no `study_instance_uid`, and a study Orthanc
cannot find (`Orthanc: study not found, details not captured`). Check for those
lines before concluding a study simply had no images.

**Pixel descriptors are filled in from Orthanc too.** The Lua callback does not
send `pixel_metadata`, so VEMS reads the descriptors of the study's first
instance back from Orthanc (`/instances/{id}/tags?simplify`) and filters them
through the same whitelist above — tag *values* only, never pixel data. A value
supplied by the callback wins over the one read back. A study with no image
instances (an SR or KOS, say) simply has no descriptors.

**A device date is judged, not trusted.** A machine whose clock was never set
sends a fixed placeholder date — one estate reports every study as `1970-08-23`.
`study_date` and `performed_at` are therefore recorded only when the value is a
real calendar date, no earlier than 1990, not in the future, and exactly eight
digits. When the claimed study date is refused but
`PerformedProcedureStepStartDate` can be believed, the study is dated by when it
was performed; when neither can be believed both are left `null`, and
`received_at` is the date to render. Every refusal is logged, and the raw
callback body is kept with the study, so what the device claimed can still be
read back.

**The machine's own description of itself.** Every study a device sends carries
its manufacturer, model, serial number, station name and software version —
better evidence than whatever was typed in at registration, so the equipment
record is kept true from it:

| Column | DICOM tag |
| ------ | --------- |
| `brand` | `Manufacturer` |
| `model` | `ManufacturerModelName` |
| `serial_number` | `DeviceSerialNumber` |
| `station_name` | `StationName` |
| `software_version` | `SoftwareVersions` |

The first three are corrected when they differ, except a serial number another
machine already holds — that is reported, not written. `station_name` and
`software_version` are kept current. Every change is logged with its previous
value. Only machines resolved from the reporting AE title are touched.

`station_name` and `software_version` are returned on the equipment detail
payloads alongside `brand`, `model` and `serial_number`.

**An accession is optional.** A callback with no `accession_number` is filed as
a [non-SHA study](#non-sha-studies) under its `study_instance_uid`. One with
neither identifier is refused with `422`, because there would be nothing to file
it under and every repeat would create another row.

**Nothing is retained in Orthanc.** The callback strips the study's pixel data
as it arrives, and `vems:prune-orthanc-studies` (daily, 03:30) deletes the
metadata-only record once VEMS holds it — see
[retention](#retention--nothing-is-kept-in-orthanc).

### POST `/dicom/callback/study-settled`

Called by the Lua once Orthanc has stopped receiving instances for a study, which
is one stability window after the last instance — 60 seconds by default
(`StableAge`). The result callback above fires on the study's *first* instance, so
what it reports is an unfinished study: the counts are the counts so far, and
instances arriving after it are not covered by the strip. This closes both gaps.

**Request Body**

| Field                | Type   | Required | Notes                                        |
| -------------------- | ------ | -------- | -------------------------------------------- |
| `study_instance_uid` | string | Yes      | How the study is matched — `422` without one |
| `accession_number`   | string | No       | Logged with a warning if nothing matches     |

No AE title is sent: Orthanc does not report the sending association for a settled
study, and the study already knows which machine it came from.

**What it does**

1. Queues `CaptureStudy` for the study — every instance is present by now, so the
   whole study can be stripped, and the counts finally mean something. Queued
   rather than inline because Orthanc holds its lock while it waits for this
   response, and calling back into it from here would deadlock until the call
   timed out (see the changelog).
2. In that job, if a worklist or non-SHA study matches the UID, **re-reads it from
   Orthanc** and replaces `series_count`, `instance_count` and `pixel_metadata`
   with the settled values — the opposite rule to the result callback, which only
   fills gaps.

`series_count` and `instance_count` in the response are as stored when it was
built: the read-back is in the queue, so with a worker already waiting they are
usually there, and otherwise they are what the earlier capture recorded.

**Response `200`**

```json
{
  "message": "Study settled; details refreshed.",
  "study_instance_uid": "1.2.826...",
  "recorded": true,
  "series_count": 3,
  "instance_count": 6
}
```

When no VEMS record matches the UID — the first callback was lost, say — the study
is still stripped (images are not kept for a study we never recorded), a warning
is logged, and the response says so:

```json
{
  "message": "Study settled; its images are being stripped, but no VEMS record matches it.",
  "study_instance_uid": "1.2.826...",
  "recorded": false
}
```

### Retention — nothing is kept in Orthanc

VEMS never stores images. A study leaves nothing behind in Orthanc either:

| Step | What is on disk |
| ---- | --------------- |
| Study arrives | The DICOM file, for seconds |
| Result callback runs | **Pixel data stripped** — the instances received so far |
| Study settles | **Rest of the pixel data stripped** — instances that arrived after the callback |
| `vems:prune-orthanc-studies` (daily) | **Study deleted** — nothing |
| VEMS | The metadata, permanently |

Every field VEMS keeps — identity, timing, provenance, image descriptors — is
read from the study while it is present, at capture time. The one field that
needs the instances to still be there is `series_count` / `instance_count`,
because a study's extent is not knowable from a single instance; that is why
the delete is a separate, later step rather than happening on arrival.

```bash
php artisan vems:prune-orthanc-studies --hours=48   # grace period (default)
php artisan vems:prune-orthanc-studies --dry-run    # list what would go
php artisan vems:prune-orthanc-studies --recheck    # re-ask about ones already pruned
```

A study is removed only when VEMS already holds it, its `study_instance_uid` is
known, it is past the grace period, and it has not already been pruned. Being
marked pruned is normally final, so a study is only ever looked at once;
`--recheck` goes back over the marked ones, which is how a backlog built up while
the study lookup was broken gets cleared.

`accession_number`, `patient_id` and `study_date`/`study_time` keep the
behaviour they had; the rest is described above.

The callback is also recorded in the device activity log as a `study_send`.

**An accession with no worklist is no longer rejected.** It is recorded as a
[non-SHA study](#non-sha-studies) and answered `200` — see below.

**Response `200`**

```json
{ "message": "Result stored successfully.", "worklist_id": "uuid", "result_status": "final" }
```

...or, when no order matches the accession:

```json
{
  "message": "Study recorded with no matching order.",
  "unmatched_study_id": "uuid",
  "accession_number": "WALKIN-0001",
  "equipment_id": "uuid",
  "vendor_id": "uuid",
  "facility_id": null
}
```

#### Non-SHA studies

A study that reaches Orthanc with no VEMS order behind it — a walk-in, a private
patient, a machine used outside the SHA workflow, or a machine that sends no
accession at all — is stored as an `unmatched_study` instead of being dropped.
Everything the callback carried is kept, including the raw payload, and the study
is attributed to the machine that reported it: **equipment → vendor → facility**.
A study whose AE title matches no equipment is kept too, and stays visible to
admins only.

> **Attribution depends on `station_ae_title`.** That is the only field that can
> be matched against `equipment.ae_title` — `station_name` is a DICOM display
> name and is not unique. `on-stable-study.lua` sends it (from `RemoteAet`),
> alongside `remote_ip`. If a study arrives with no `station_ae_title`, or with
> one that matches no equipment, it is filed as unattributed.

As with ordered studies, no pixel data is retained — the study is stripped in
Orthanc the same way.

Reported newest first, filterable by `modality`, `equipment_id`, `vendor_id`,
`facility_id`, `keph_level` (the attributed facility's level,
case-insensitive), `search` (accession, study UID, patient id, station name, AE
title, description), `attributed` (`true`/`false`), `period` / `from` / `to`, and
`page_size`.

| Endpoint | Sees |
| -------- | ---- |
| `GET /admin/studies/unmatched` | Every non-SHA study, including unattributed ones |
| `GET /vendor/studies/unmatched` | Studies on this vendor's machines |
| `GET /facility/studies/unmatched` | Studies on machines the facility owns or that vendors mapped to it |

```json
{
  "summary": {
    "total": 12,
    "this_month": 3,
    "unattributed": 1,
    "latest_received_at": "2026-09-24T09:30:00+03:00"
  },
  "data": [
    {
      "id": "uuid",
      "received_at": "2026-09-24T09:30:00+03:00",
      "accession_number": "WALKIN-0001",
      "study_instance_uid": "1.2.826.0.1.3680043.8.498.10",
      "series_instance_uid": null,
      "patient_id": "WALKIN001",
      "modality": "DX",
      "study_description": "Chest X-Ray (PA)",
      "body_part": "CHEST",
      "institution_name": "Some Clinic",
      "manufacturer": "GE",
      "station_name": "ROOM-3",
      "referring_physician": "Dr^Walker",
      "study_date": "2026-09-24",
      "study_time": "093000",
      "performed_at": "2026-09-24T09:25:00+03:00",
      "series_count": 2,
      "instance_count": 5,
      "pixel_metadata": { "rows": 2048, "columns": 2048 },
      "source_ae_title": "XRD01",
      "remote_ip": "10.44.55.66",
      "attributed": true,
      "equipment": { "id": "uuid", "code": "XRD01", "name": "…", "ae_title": "XRD01" },
      "vendor": { "id": "uuid", "name": "Melco Kenya Ltd", "code": "VEN001" },
      "facility": null
    }
  ],
  "pagination": { "current_page": 1, "per_page": 25, "total": 12, "total_pages": 1 },
  "available_filters": {
    "modality": [
      { "value": "DX", "label": "DX" },
      { "value": "CT", "label": "CT" }
    ],
    "attributed": [
      { "value": "true", "label": "On a known machine" },
      { "value": "false", "label": "Unattributed" }
    ],
    "period": [{ "value": "7d", "label": "Last 7 Days" }]
  }
}
```

`available_filters.modality` lists only the modalities present in the studies
that caller can see, so no one is offered a filter that would come back empty —
a facility never sees a modality it has never received, and a vendor is never
shown another vendor's. `attributed` and `period` report the values the filters
accept. `equipment_id`, `vendor_id` and `facility_id` are absent by design: those
are chosen from the equipment and facility listings rather than offered here.

Every dashboard carries the same counter as `unmatched_studies`
(`counts.unmatched_studies` on the admin dashboard, `data.unmatched_studies` on
the vendor and facility ones), scoped to whatever that caller can see.

#### POST `/dicom/callback/status`

Called by Orthanc when a DICOM status update occurs (MPPS).

---

## 9. Equipment Status Logs

### GET `/equipment-status`

List equipment status change logs.

**Query Parameters**

| Param          | Type    | Notes                  |
| -------------- | ------- | ---------------------- |
| `equipment_id` | uuid    | Filter by equipment    |
| `status`       | string  | Filter by status value |
| `from`         | date    | `Y-m-d`                |
| `to`           | date    | `Y-m-d`                |
| `per_page`     | integer | 1–100, default 15      |

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "equipment_id": "uuid",
      "equipment_code": "XRAY-001",
      "equipment_name": "GE Discovery XR656",
      "status": "maintenance",
      "started_at": "2025-05-01T09:00:00+03:00",
      "ended_at": null,
      "downtime_minutes": null,
      "downtime_formatted": null,
      "reason": "Scheduled maintenance",
      "recorded_by": "Admin User",
      "resolved_by": null
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 25,
    "total_pages": 2
  }
}
```

---

### POST `/equipment-status`

Log an equipment status change.

| Field          | Type   | Required | Notes                    |
| -------------- | ------ | -------- | ------------------------ |
| `equipment_id` | uuid   | Yes      |                          |
| `status`       | string | Yes      | New status value         |
| `notes`        | string | No       | Reason for status change |

**Response `201`** — Downtime started.

```json
{
  "message": "Equipment status logged successfully.",
  "log": {
    "id": "uuid",
    "equipment_id": "uuid",
    "equipment_code": "XRAY-001",
    "equipment_name": "GE Discovery XR656",
    "status": "maintenance",
    "started_at": "2025-05-01T09:00:00+03:00",
    "ended_at": null,
    "downtime_minutes": null,
    "downtime_formatted": null,
    "reason": "Scheduled maintenance",
    "recorded_by": "Admin User",
    "resolved_by": null
  }
}
```

**Response `201`** — Equipment brought back up (downtime resolved).

```json
{
  "message": "Equipment status resolved.",
  "log": {
    "id": "uuid",
    "equipment_id": "uuid",
    "status": "active",
    "started_at": "2025-05-01T09:00:00+03:00",
    "ended_at": "2025-05-01T12:00:00+03:00",
    "downtime_minutes": 180,
    "downtime_formatted": "3h 0m",
    "reason": "Maintenance completed"
  }
}
```

**Response `409`** — Equipment already in downtime.

---

### GET `/equipment-status/{id}`

Get a single status log entry.

**Response `200`**

```json
{
  "data": {
    "id": "uuid",
    "equipment_id": "uuid",
    "equipment_code": "XRAY-001",
    "equipment_name": "GE Discovery XR656",
    "status": "maintenance",
    "started_at": "2025-05-01T09:00:00+03:00",
    "ended_at": null,
    "downtime_minutes": null,
    "downtime_formatted": null,
    "reason": "Scheduled maintenance",
    "recorded_by": "Admin User",
    "resolved_by": null,
    "notes": "Annual service",
    "created_at": "2025-05-01T09:00:00+03:00",
    "updated_at": "2025-05-01T09:00:00+03:00",
    "current_downtime_minutes": 45,
    "current_downtime_formatted": "0h 45m"
  }
}
```

---

### GET `/equipment-status/active-downtimes`

List equipment currently in downtime (maintenance/non-operational).

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "equipment_id": "uuid",
      "equipment_code": "XRAY-001",
      "equipment_name": "GE Discovery XR656",
      "status": "maintenance",
      "started_at": "2025-05-01T09:00:00+03:00",
      "ended_at": null,
      "downtime_minutes": null,
      "downtime_formatted": null,
      "reason": "Scheduled maintenance",
      "recorded_by": "Admin User",
      "resolved_by": null,
      "current_downtime_minutes": 120,
      "current_downtime_formatted": "2h 0m"
    }
  ],
  "total_active_downtimes": 3
}
```

---

### GET `/equipment-status/summary`

Get status summary across all equipment.

**Response `200`**

```json
{
  "summary": {
    "total_incidents": 42,
    "total_downtime_minutes": 9390,
    "total_downtime_formatted": "156h 30m",
    "average_downtime_minutes": 223,
    "average_downtime_formatted": "3h 43m",
    "max_downtime_minutes": 1440,
    "max_downtime_formatted": "24h 0m",
    "affected_equipment_count": 15,
    "active_downtimes_count": 3
  },
  "top_downtime_equipment": [
    {
      "equipment_id": "uuid",
      "equipment_code": "CT-002",
      "equipment_name": "Siemens Somatom",
      "incident_count": 5,
      "total_downtime_minutes": 2400,
      "total_downtime_formatted": "40h 0m"
    }
  ]
}
```

---

### GET `/equipment-status/equipment/{equipment}/stats`

Get status statistics for a specific equipment over time.

**Response `200`**

```json
{
  "equipment": {
    "id": "uuid",
    "code": "XRAY-001",
    "name": "GE Discovery XR656",
    "status": "active"
  },
  "statistics": {
    "total_downtimes": 3,
    "total_downtime_minutes": 540,
    "total_downtime_formatted": "9h 0m",
    "average_downtime_minutes": 180,
    "average_downtime_formatted": "3h 0m",
    "max_downtime_minutes": 240,
    "max_downtime_formatted": "4h 0m",
    "min_downtime_minutes": 120,
    "min_downtime_formatted": "2h 0m"
  },
  "active_downtime": {
    "id": "uuid",
    "started_at": "2025-05-01T09:00:00+03:00",
    "reason": "Scheduled maintenance",
    "current_downtime_minutes": 120,
    "current_downtime_formatted": "2h 0m"
  },
  "common_reasons": [
    { "reason": "Scheduled maintenance", "count": 2 },
    { "reason": "Power failure", "count": 1 }
  ]
}
```

---

## 10. SHA Procedures

### GET `/procedures`

List SHA procedures with filtering.

**Query Parameters**

| Param             | Type    | Notes                            |
| ----------------- | ------- | -------------------------------- |
| `lifecycle_state` | string  | `active`, `suspended`, `retired` |
| `category`        | string  | Procedure category               |
| `search`          | string  | Free-text search                 |
| `page`            | integer | Default 1                        |
| `page_size`       | integer | 1–500, default 20                |
| `skip`            | integer | Offset (alternative to page)     |
| `limit`           | integer | 1–500                            |

**Response `200`** — Array of procedure objects.

```json
{
  "data": [
    {
      "id": "uuid",
      "procedure_code": "XRAY-CHEST-PA",
      "name": "Chest X-Ray PA",
      "category": "Radiology",
      "procedure_type": "Diagnostic",
      "description": "Posteroanterior chest radiograph",
      "reimbursement_amount": 3500.00,
      "currency": "KES",
      "effective_from": "2025-01-01T00:00:00+03:00",
      "effective_to": null,
      "lifecycle_state": "active",
      "created_at": "2025-01-01T00:00:00+03:00",
      "updated_at": "2025-01-01T00:00:00+03:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

---

### POST `/procedures`

Create a new SHA procedure.

| Field                  | Type     | Required | Notes              |
| ---------------------- | -------- | -------- | ------------------ |
| `procedure_code`       | string   | Yes      | 1–50 chars, unique |
| `name`                 | string   | Yes      | 1–255 chars        |
| `category`             | string   | No       | Max 100 chars      |
| `procedure_type`       | string   | No       | Max 100 chars      |
| `description`          | string   | No       |                    |
| `reimbursement_amount` | number   | Yes      | Minimum 0          |
| `currency`             | string   | No       | Default `KES`      |
| `effective_from`       | datetime | Yes      |                    |
| `effective_to`         | datetime | No       |                    |
| `lifecycle_state`      | string   | No       | Default `active`   |

**Response `201`** — Procedure created. Returns the full procedure object.

---

### GET `/procedures/active/list`

List only active procedures (returns simple list for frontend dropdowns).

| Param   | Type    | Notes              |
| ------- | ------- | ------------------ |
| `skip`  | integer | Default 0          |
| `limit` | integer | 1–500, default 100 |

**Response `200`** — Flat array (not wrapped in `data`).

```json
[
  {
    "id": "uuid",
    "procedure_code": "XRAY-CHEST-PA",
    "name": "Chest X-Ray PA",
    "category": "Radiology",
    "reimbursement_amount": 3500.00,
    "currency": "KES"
  }
]
```

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

---

## 11. Lots & Services

### GET `/lots`

List equipment/contract lots.

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "number": "1",
      "name": "Diagnostics Imaging X-ray",
      "is_active": true,
      "services_count": 8
    }
  ],
  "pagination": { "current_page": 1, "per_page": 20, "total": 12, "total_pages": 1 }
}
```

---

### POST `/lots`

Create a new lot.

| Field         | Type   | Required | Notes             |
| ------------- | ------ | -------- | ----------------- |
| `name`        | string | Yes      |                   |
| `number`      | string | Yes      | Unique lot number |
| `facility_id` | uuid   | Yes      |                   |
| `vendor_id`   | uuid   | No       |                   |
| `description` | string | No       |                   |

**Response `201`**

```json
{
  "message": "Lot created successfully.",
  "lot": {
    "id": "uuid",
    "number": "1",
    "name": "Diagnostics Imaging X-ray",
    "is_active": true,
    "services_count": 0
  }
}
```

**Response `409`** — Lot number already exists.

---

### GET `/lots/{lot}`

Get lot details.

**Response `200`**

```json
{
  "data": {
    "id": "uuid",
    "number": "1",
    "name": "Diagnostics Imaging X-ray",
    "is_active": true,
    "services_count": 8,
    "created_at": "2025-01-01T00:00:00+03:00",
    "updated_at": "2025-01-01T00:00:00+03:00"
  }
}
```

**Response `404`** — Lot not found.

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

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "lot_id": "uuid",
      "name": "Chest X-Ray PA",
      "code": "XRAY-CHEST-PA",
      "modality": "DX",
      "tariff": 3500.00,
      "vendor_share": 2100.00,
      "facility_share": 1400.00,
      "capitated": false,
      "is_active": true
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 8,
    "from": 1,
    "to": 8
  }
}
```

#### POST `/lots/{lot}/services`

Add a service to a lot.

| Field      | Type   | Required | Notes                  |
| ---------- | ------ | -------- | ---------------------- |
| `code`     | string | Yes      | Service/procedure code |
| `name`     | string | Yes      |                        |
| `tariff`   | number | Yes      |                        |
| `modality` | string | No       | DICOM modality code    |
| `category` | string | No       |                        |

#### GET `/lots/{lot}/services/{service}`

Get a single lot service.

**Response `200`**

```json
{
  "data": {
    "id": "uuid",
    "lot_id": "uuid",
    "name": "Chest X-Ray PA",
    "code": "XRAY-CHEST-PA",
    "modality": "DX",
    "tariff": 3500.00,
    "vendor_share": 2100.00,
    "facility_share": 1400.00,
    "capitated": false,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00+03:00",
    "updated_at": "2025-01-01T00:00:00+03:00"
  }
}
```

#### PATCH `/lots/{lot}/services/{service}`

Update lot service. All fields optional.

#### DELETE `/lots/{lot}/services/{service}`

Remove service from lot.

---

## 12. Contracts

**Auth required** for all contract endpoints.

### GET `/contracts`

List contracts with pagination. Filter with `vendor_id`, `vendor_code`, `facility_id`, `keph_level` (the facility's level, case-insensitive), `lot_id` (contracts that include any service from that lot), `status`, `search`, `current_only` and `expired_only`.

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "contract_number": "VEMS/2025/001",
      "vendor": { "id": "uuid", "name": "Melco Kenya Ltd", "code": "VEN001" },
      "facility": { "id": "uuid", "name": "Kenyatta National Hospital", "code": "KNH" },
      "start_date": "2025-01-01",
      "end_date": "2025-12-31",
      "status": "active",
      "notes": null,
      "created_by": { "id": "uuid", "name": "Admin User" },
      "created_at": "2025-01-01T00:00:00+03:00",
      "services_count": 5,
      "services": [
        {
          "id": "uuid",
          "lot": { "id": "uuid", "number": "1", "name": "Diagnostics Imaging X-ray" },
          "service": { "id": "uuid", "code": "XRAY-CHEST-PA", "name": "Chest X-Ray PA", "tariff": 3500.00 },
          "equipment": { "id": "uuid", "code": "XRAY-001", "name": "GE Discovery XR656", "category": "xray_digital", "status": "active" },
          "is_active": true
        }
      ]
    }
  ],
  "pagination": { "current_page": 1, "per_page": 20, "total": 30, "total_pages": 2 }
}
```

---

### POST `/contracts`

Create a new contract between a vendor and facility.

| Field             | Type   | Required | Notes                           |
| ----------------- | ------ | -------- | ------------------------------- |
| `vendor_id`       | uuid   | Yes      |                                 |
| `facility_id`     | uuid   | Yes      |                                 |
| `contract_number` | string | Yes      | Unique                          |
| `start_date`      | date   | Yes      |                                 |
| `end_date`        | date   | No       |                                 |
| `status`          | string | No       | `active`, `inactive`, `expired` |
| `terms`           | string | No       |                                 |

---

### GET `/contracts/{contract}`

Get contract details with services.

**Response `200`**

```json
{
  "data": {
    "id": "uuid",
    "contract_number": "VEMS/2025/001",
    "vendor": { "id": "uuid", "name": "Melco Kenya Ltd", "code": "VEN001", "email": "info@melco.co.ke", "phone": "+254700000000" },
    "facility": { "id": "uuid", "name": "KNH", "code": "KNH", "keph_level": "6", "facility_type": "National Referral Hospital" },
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "status": "active",
    "is_currently_active": true,
    "is_expired": false,
    "notes": null,
    "created_by": { "id": "uuid", "name": "Admin User" },
    "created_at": "2025-01-01T00:00:00+03:00",
    "services_count": 5,
    "lots": [
      {
        "lot": { "id": "uuid", "number": "1", "name": "Diagnostics Imaging X-ray" },
        "services": [
          {
            "id": "uuid",
            "service": { "id": "uuid", "code": "XRAY-CHEST-PA", "name": "Chest X-Ray PA", "tariff": 3500.00, "vendor_share": 2100.00, "facility_share": 1400.00 },
            "equipment": { "id": "uuid", "code": "XRAY-001", "name": "GE Discovery XR656", "category": "xray_digital", "status": "active" },
            "is_active": true
          }
        ]
      }
    ]
  }
}
```

---

### PUT `/contracts/{contract}`

Update contract.

---

### DELETE `/contracts/{contract}`

Delete contract.

---

### GET `/contracts/facility/{facility}/discover`

Discover services available to a facility through its active contracts.

**Response `200`**

```json
{
  "facility_id": "uuid",
  "total_contracts": 2,
  "data": [
    {
      "contract": {
        "id": "uuid",
        "contract_number": "VEMS/2025/001",
        "vendor": { "id": "uuid", "name": "Melco Kenya Ltd", "code": "VEN001" },
        "end_date": "2025-12-31"
      },
      "lots": [
        {
          "lot": { "id": "uuid", "number": "1", "name": "Diagnostics Imaging X-ray" },
          "services": [
            {
              "contract_service_id": "uuid",
              "service": { "id": "uuid", "code": "XRAY-CHEST-PA", "name": "Chest X-Ray PA", "tariff": 3500.00 },
              "equipment": { "id": "uuid", "code": "XRAY-001", "name": "GE Discovery XR656", "status": "active" }
            }
          ]
        }
      ]
    }
  ]
}
```

---

### Contract Services

#### GET `/contracts/{contract}/services`

List services under a contract.

**Response `200`**

```json
{
  "contract": { "id": "uuid", "contract_number": "VEMS/2025/001" },
  "total_services": 5,
  "data": [
    {
      "lot": { "id": "uuid", "number": "1", "name": "Diagnostics Imaging X-ray" },
      "services": [
        {
          "id": "uuid",
          "service": { "id": "uuid", "code": "XRAY-CHEST-PA", "name": "Chest X-Ray PA", "tariff": 3500.00 },
          "equipment": { "id": "uuid", "code": "XRAY-001", "name": "GE Discovery XR656" },
          "is_active": true
        }
      ]
    }
  ]
}
```

#### POST `/contracts/{contract}/services`

Add a service to a contract.

| Field                       | Type   | Required | Notes                      |
| --------------------------- | ------ | -------- | -------------------------- |
| `lot_service_id`            | uuid   | Yes      | Reference to a lot service |
| `tariff`                    | number | Yes      | Contract-specific tariff   |
| `vendor_share_percentage`   | number | No       | 0–100                      |
| `facility_share_percentage` | number | No       | 0–100                      |

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

| Field                            | Type    | Required | Notes                                          |
| -------------------------------- | ------- | -------- | ---------------------------------------------- |
| `facility_id`                    | uuid    | Yes      |                                                |
| `patient_id`                     | uuid    | Yes      |                                                |
| `override`                       | boolean | No       | Skip finance approval                          |
| `notes`                          | string  | No       | Max 2000 chars                                 |
| `services`                       | array   | Yes      | Min 1 item                                     |
| `services.*.contract_service_id` | uuid    | Yes      | Must belong to this facility's active contract |
| `services.*.practitioner_id`     | uuid    | No       |                                                |
| `services.*.scheduled_date`      | string  | Yes      | Format `Y-m-d H:i`, must be today or future    |
| `services.*.notes`               | string  | No       | Max 500 chars                                  |

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

| Param        | Type   | Required |
| ------------ | ------ | -------- |
| `session_id` | string | Yes      |

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

| Param              | Type    | Notes                                             |
| ------------------ | ------- | ------------------------------------------------- |
| `fr_code`          | string  | Filter by facility FR code                        |
| `facility_id`      | uuid    |                                                   |
| `keph_level`       | string  | The facility's KEPH level (case-insensitive)      |
| `vendor_id`        | uuid    | Bookings with a service assigned to this vendor   |
| `patient_id`       | uuid    |                                                   |
| `status`           | string  | `pending_otp`, `active`, `completed`, `cancelled` |
| `source`           | string  | `provider_portal`, `hmis`, `standalone`           |
| `from`             | date    | `Y-m-d`                                           |
| `to`               | date    | `Y-m-d`                                           |
| `search`           | string  | Booking number, patient name, ID number           |
| `sort_by`          | string  | `booking_number`, `status`, `created_at`          |
| `sort_order`       | string  | `asc`, `desc`                                     |
| `per_page`         | integer | 1–100, default 15                                 |
| `finance_approved` | boolean |                                                   |

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

| Param    | Notes                    |
| -------- | ------------------------ |
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

**Query Parameters**

| Param     | Type   | Required | Notes                  |
| --------- | ------ | -------- | ---------------------- |
| `fr_code` | string | Yes      | Facility Registry code |

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

| Field                        | Notes                                                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `visit_id`                   | UUID, must be unique across all bookings                                                                                      |
| `fr_code`                    | Facility Registry code                                                                                                        |
| `patient.identificationType` | `National ID`, `Temporary ID`, `Alien ID`, `Refugee ID`, `Mandate Number`, `Birth Certificate`, `Birth Notification`, `CR ID` |
| `services.*.practitioner`    | Optional; all three sub-fields required if provided                                                                           |

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

### GET `/provider/bookings/show`

Get a single provider portal booking by `visit_id` or `claim_id`.

**Query Parameters** (one required)

| Param      | Type | Notes                 |
| ---------- | ---- | --------------------- |
| `visit_id` | uuid | HMIS visit identifier |
| `claim_id` | uuid | SHA claim identifier  |

---

### GET `/provider/bookings/costs`

Get cost breakdown for all services in a booking.

**Query Parameters** (one required)

| Param      | Type | Notes                 |
| ---------- | ---- | --------------------- |
| `visit_id` | uuid | HMIS visit identifier |
| `claim_id` | uuid | SHA claim identifier  |

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

### POST `/provider/bookings/claim`

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

### POST `/provider/bookings/services`

Add additional services to an existing booking. Identifies the booking by `visit_id` or `claim_id` in the request body.

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

| Param              | Type   | Required | Values                           |
| ------------------ | ------ | -------- | -------------------------------- |
| `reference_type`   | string | Yes      | `booking_reference`, `claim_id`  |
| `reference_number` | string | Yes      | The booking number or claim UUID |

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

| Field                 | Type   | Required | Notes                              |
| --------------------- | ------ | -------- | ---------------------------------- |
| `request_id`          | string | Yes      | EMR system request ID, 1–100 chars |
| `patient_id`          | string | Yes      | Patient identifier, 1–100 chars    |
| `patient_first_name`  | string | Yes      | 1–100 chars                        |
| `patient_last_name`   | string | No       | Max 100 chars                      |
| `patient_mrn`         | string | No       | Medical record number              |
| `date_of_birth`       | date   | No       |                                    |
| `sex`                 | string | No       | `M`, `F`, `U`, `O`, default `U`    |
| `modality`            | string | No       | Legacy modality code, max 32 chars |
| `description`         | string | No       | Max 500 chars                      |
| `institution_name`    | string | No       | Max 255 chars                      |
| `procedures`          | array  | Yes      | SHA procedure codes (min 1)        |
| `facility_id`         | string | Yes      | 1–50 chars                         |
| `claim_id`            | string | No       | Max 100 chars                      |
| `payor`               | string | No       | Max 100 chars                      |
| `preauth_code`        | string | No       | Max 100 chars                      |
| `callback_url`        | uri    | No       | Max 2083 chars                     |
| `callback_auth_type`  | string | No       | Default `Bearer`                   |
| `callback_auth_token` | string | No       | Max 500 chars                      |
| `idempotency_key`     | string | Yes      | Unique key for idempotency         |
| `request_metadata`    | object | No       |                                    |

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

| Field                 | Type   | Required | Notes                 |
| --------------------- | ------ | -------- | --------------------- |
| `claim_id`            | string | Yes      | 1–100 chars           |
| `payor`               | string | No       | Max 100 chars         |
| `preauth_code`        | string | No       | Max 100 chars         |
| `request_id`          | string | No       | EMR request ID        |
| `internal_request_id` | string | No       | Middleware request ID |

---

### GET `/requests`

List medical requests with filtering and pagination.

**Query Parameters**

| Param           | Type    | Notes                                                        |
| --------------- | ------- | ------------------------------------------------------------ |
| `status`        | string  | `pending`, `in_progress`, `completed`, `failed`, `cancelled` |
| `patient_id`    | string  |                                                              |
| `patient`       | string  | Patient name search                                          |
| `facility_id`   | string  |                                                              |
| `keph_level`    | string  | The addressed facility's KEPH level (case-insensitive)       |
| `vendor_id`     | string  | Vendor from the named machine, or from the contract when the order names a facility only |
| `period`        | string  | `7d`, `30d`, `90d`, `12m`, `this_month`, `this_year`         |
| `from` / `to`   | date    | Explicit range; overrides `period`                           |
| `facility_name` | string  |                                                              |
| `page`          | integer | Default 1                                                    |
| `page_size`     | integer | 1–100, default 20                                            |

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

| Param         | Type   | Notes           |
| ------------- | ------ | --------------- |
| `facility_id` | string | Target facility |

---

### POST `/requests/{request_id}/retarget`

Change request target facility/equipment and reset assignment for worklist resend.

| Field          | Type   | Required | Notes      |
| -------------- | ------ | -------- | ---------- |
| `facility_id`  | string | Yes      | 1–50 chars |
| `equipment_id` | uuid   | Yes      |            |

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

| Field            | Type     | Required | Notes           |
| ---------------- | -------- | -------- | --------------- |
| `equipment_id`   | uuid     | No       |                 |
| `procedure_code` | string   | No       | 1–50 chars      |
| `status`         | string   | No       | Default `final` |
| `performed_at`   | datetime | No       |                 |
| `result_payload` | object   | No       |                 |

---

### GET `/requests/stats/summary`

Get request statistics.

| Param         | Type    | Notes              |
| ------------- | ------- | ------------------ |
| `facility_id` | string  | Filter by facility |
| `keph_level`  | string  | Filter by the facility's KEPH level (case-insensitive) |
| `days`        | integer | 1–90, default 7    |

---

## 19. DICOM Events & Callbacks

### The worklist round trip

A worklist leaves VEMS and its study comes back under the same accession
number, so the whole chain can be driven and verified end to end:

1. An order raises the worklist (`scheduled`) and it is pushed to Orthanc, which
   flips it to `sent`.
2. The modality C-FINDs it. `on-cfind-discovery.lua` posts to
   `POST /dicom/discovered`, which stores the device's real IP/port and logs a
   `worklist_pull` activity.
3. The modality runs the procedure step — `POST /dicom/events/mpps` with
   `IN PROGRESS`, then `COMPLETED`.
4. The study arrives — `POST /dicom/events/c-store` stores a `preliminary` result.
5. Orthanc reports the finished study — `POST /dicom/callback/result`, which
   stores the `final` result, the study metadata, and credits the machine that
   performed it.

`internal_request_id` on the MPPS/C-STORE endpoints accepts **either** the
worklist UUID **or** its accession number (`ACC202609240001`).

### Test worklists

`POST /vendor/worklist-test` creates a probe worklist on Orthanc *and* a
matching row in VEMS flagged `is_test`, so the study the modality sends back is
attached to it exactly like a real one — the loop closes instead of the result
callback answering `404`.

| Field | Required | Notes |
| ----- | -------- | ----- |
| `equipment_id` | Yes | Must belong to the calling vendor, and have an AE title |
| `patient_id` | No | UUID of a real patient to depict |
| `accession_number` | No | Defaults to a real accession from the live sequence |

**The probe carries a demo patient, not a real one.** The DICOM tags are built
by the same code that builds an ordered worklist, so the modality renders
something representative — but the person on it is synthetic, because a test
order does not belong to any patient:

| Tag | Value |
| --- | ----- |
| `PatientID` | A fresh `VT` number, e.g. `VT762` — no hyphens, never a real identifier |
| `PatientName` | A demo name, as `GIVEN^FAMILY` |
| `PatientSex` | Randomly `M` or `F` |
| `PatientBirthDate` | A random date of birth, `Ymd` |
| `AccessionNumber` | A real accession, e.g. `ACC202609240007` |
| `InstitutionName` | The facility the machine belongs to |

Every probe generates a **new** demo patient, so consecutive tests are
distinguishable on the worklist.

Pass `patient_id` (a real patient UUID) to put that record on the probe instead
— useful when a site wants to check a real patient end to end. Leave it out and
no real patient is ever exposed to a modality: the most recent order's patient
is deliberately *not* used as a fallback.

The response echoes the `patient` record when one was supplied, and always
echoes the exact DICOM block sent:

```json
{
  "data": {
    "worklist_id": "uuid",
    "accession_number": "ACC202609240007",
    "patient": null,
    "dicom_patient": {
      "PatientID": "VT762", "PatientName": "John^Dore",
      "PatientSex": "F", "PatientBirthDate": "19740902"
    }
  }
}
```

> A probe names the machine it is testing in `ScheduledStationAETitle`, unlike a
> real order, which may leave the scheduled station open so any eligible machine
> at the facility can pick the study up.

- Test worklists are excluded from `active_worklists` on the dashboard, so
  running one never moves an operational figure.
- They carry no booked service (`booked_service_id` is null) and are never
  pushed to Orthanc by the model — the endpoint pushes its own probe tags, so a
  double push would create a duplicate entry.
- The accession is rejected with `422` if it belongs to another worklist.

### Equipment testing component

Every probe a device has ever run is attached to its **equipment detail payload**
as `worklist_tests`, so the same history table renders in the vendor, facility
and admin portals with no second call. Newest test first.

```json
"worklist_tests": {
  "total": 3,
  "succeeded": 2,
  "awaiting_result": 1,
  "last_tested_at": "2026-09-24T08:30:00+03:00",
  "results": [
    {
      "id": "uuid",
      "accession_number": "ACC202609240007",
      "worklist_status": "completed",
      "result_status": "final",
      "succeeded": true,
      "awaiting_result": false,
      "result_received_at": "2026-09-24T08:31:12+03:00",
      "study_instance_uid": "1.2.826.0.1.3680043.8.498.10",
      "study_date": "2026-09-24",
      "performed_by_ae_title": "XRD01",
      "performed_by": { "id": "uuid", "code": "XRD01", "name": "…", "ae_title": "XRD01" },
      "created_at": "2026-09-24T08:30:00+03:00",
      "sent_at": "2026-09-24T08:30:01+03:00",
      "completed_at": "2026-09-24T08:31:12+03:00"
    }
  ]
}
```

- **`succeeded`** is the one to badge on: it is `true` exactly when the study
  came back (`result_received_at` is set). VEMS only learns of a study through
  the result callback, so a result on the row is proof that the whole
  C-FIND → acquisition → C-STORE → callback chain worked.
- **`awaiting_result`** is a probe still out — the equipment may be unreachable,
  or the study has not been sent back yet.
- `total`, `succeeded` and `awaiting_result` count **all** tests; `results` is
  the newest 20.
- Returns an empty `results` array with zeroed counts on equipment that has
  never been tested.

### POST `/dicom/events/mpps`

Receive MPPS (Modality Performed Procedure Step) event update from equipment.

| Field                 | Type     | Required | Notes                                  |
| --------------------- | -------- | -------- | -------------------------------------- |
| `internal_request_id` | string   | Yes      |                                        |
| `equipment_id`        | string   | No       | Equipment UUID                         |
| `equipment_code`      | string   | No       | Equipment code, asset_id, or DICOM AET |
| `station_ae_title`    | string   | No       | Credits the reporting machine            |
| `remote_ip`           | string   | No       | Refreshes the station's `reported_ip`; `hl7_host` only when no other machine reports it |
| `remote_port`         | integer  | No       | Refreshes its `dicom_port`/`hl7_port`    |
| `procedure_code`      | string   | Yes      |                                        |
| `status`              | string   | Yes      |                                        |
| `performed_at`        | datetime | No       |                                        |
| `payload`             | object   | No       |                                        |

---

### POST `/dicom/events/c-store`

Receive C-STORE payload and persist structured result.

| Field                 | Type     | Required | Notes                                  |
| --------------------- | -------- | -------- | -------------------------------------- |
| `internal_request_id` | string   | Yes      |                                        |
| `equipment_id`        | string   | No       | Equipment UUID                         |
| `equipment_code`      | string   | No       | Equipment code, asset_id, or DICOM AET |
| `station_ae_title`    | string   | No       | Credits the reporting machine            |
| `remote_ip`           | string   | No       | Refreshes the station's `reported_ip`; `hl7_host` only when no other machine reports it |
| `remote_port`         | integer  | No       | Refreshes its `dicom_port`/`hl7_port`    |
| `procedure_code`      | string   | Yes      |                                        |
| `performed_at`        | datetime | No       |                                        |
| `result_payload`      | object   | Yes      |                                        |

---

### POST `/dicom/events/ping-request`

Receive machine ping/test-connection event from Orthanc and queue for approval.

Same body as `POST /equipment/ping-requests`.

---

### GET `/dicom/events/ping-events`

The device activity log — same response as `GET /equipment/ping-requests/activity`,
which is the preferred route. Records connects, worklist pulls and study sends
with the bare source name.

**Auth required** (admin/nesp/moh/cog).

List Orthanc ping events.

| Param        | Type    | Default | Notes |
| ------------ | ------- | ------- | ----- |
| `event_type` | string  | `ping`  |       |
| `forwarded`  | boolean | `false` |       |
| `page`       | integer | 1       |       |
| `page_size`  | integer | 50      | 1–500 |

---

### GET `/dicom/dead-letters`

List dead-lettered DICOM events for operations follow-up.

| Param    | Type   | Notes                          |
| -------- | ------ | ------------------------------ |
| `status` | string | `open`, `retrying`, `resolved` |

---

## 20. SHA Verification & Interventions

SHA (Social Health Authority) verification endpoints. **Auth required.**

### POST `/sha/verification`

Verify equipment use for SHA using patient/procedure/facility/time tuple.

If `time_done` is provided, a ±15 minute matching window is used.

| Field         | Type     | Required | Notes          |
| ------------- | -------- | -------- | -------------- |
| `patient_id`  | string   | Yes      |                |
| `procedure`   | string   | Yes      | Procedure code |
| `facility_id` | string   | Yes      |                |
| `time_done`   | datetime | No       |                |

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

| Field                 | Type   | Required | Notes       |
| --------------------- | ------ | -------- | ----------- |
| `request_id`          | string | No       | 1–100 chars |
| `internal_request_id` | string | No       | 1–100 chars |

**Response `200`**

```json
{
  "emr_request_id": "REQ-2025-00123",
  "middleware_id": "uuid",
  "validate_equipment_use": true
}
```

**Response `422`** — Neither request_id nor internal_request_id provided.

---

### POST `/sha/v1/claim-verification`

Return EMR booking and service details for SHA claim verification.

Accepts `request_id`, `internal_request_id`, or `claim_id`. At least one identifier required.

| Field                 | Type   | Required | Notes              |
| --------------------- | ------ | -------- | ------------------ |
| `request_id`          | string | No       | EMR booking number |
| `internal_request_id` | string | No       | Middleware ID      |
| `claim_id`            | string | No       | Claim ID           |

**Response `200`**

```json
{
  "message": "Claim verification details retrieved.",
  "booking": { /* Booking object */ },
  "patient": { /* Patient object */ },
  "facility": { /* Facility object */ },
  "financial_summary": { /* Financial summary */ },
  "services": [ /* Service list */ ]
}
```

**Response `200`** — No results found.

```json
{
  "message": "No matching booking found.",
  "booking": null,
  "patient": null,
  "facility": null,
  "financial_summary": null,
  "services": []
}
```

---

### POST `/sha/v2/verification`

Verify claim details by source.

- `hmis` uses the middleware's internal claim lookup.
- `provider_portal` proxies the request to VEMS.

| Field      | Type   | Required | Notes                       |
| ---------- | ------ | -------- | --------------------------- |
| `claim_id` | string | Yes      | 1–100 chars                 |
| `source`   | string | Yes      | `provider_portal` or `hmis` |

---

### GET `/sha/interventions`

Expose completed interventions with request, equipment, timing, and result details.

**Query Parameters**

| Param                 | Type   | Notes                    |
| --------------------- | ------ | ------------------------ |
| `patient_id`          | string |                          |
| `id_number`           | string | National ID / MRN lookup |
| `emr_request_id`      | string |                          |
| `facility_id`         | string |                          |
| `internal_request_id` | string |                          |

**Response `200`**

```json
{
  "data": [
    {
      "lot_number": "1",
      "lot_name": "Diagnostics Imaging X-ray",
      "services": [
        {
          "id": "uuid",
          "code": "XRAY-CHEST-PA",
          "name": "Chest X-Ray PA",
          "description": "Posteroanterior chest radiograph",
          "tariff_amount": 3500.00,
          "vendor_share_percent": 60.00,
          "facility_share_percent": 40.00
        }
      ]
    }
  ],
  "pagination": { "current_page": 1, "per_page": 20, "total": 50, "total_pages": 3 }
}
```

---

### POST `/sha/callback/claim-status`

> **Internal** — SHA callback endpoint for claim status updates.

---

## 21. Admin Dashboard & Analytics

> **Auth required.** Admin oversight endpoints.

### GET `/admin/dashboard`

High-level counts, modality breakdown, SHA claim stats, a booking trend, and efficiency stats.

**Query Parameters**

| Param           | Type   | Notes                                                                      |
| --------------- | ------ | -------------------------------------------------------------------------- |
| `county_id`     | uuid   |                                                                            |
| `facility_id`   | uuid   |                                                                            |
| `facility_type` | string |                                                                            |
| `keph_level`    | string | Facility KEPH level (case-insensitive)                                     |
| `vendor_id`     | uuid   |                                                                            |
| `lot_id`        | uuid   |                                                                            |
| `period`        | string | `7d`, `30d`, `90d`, `12m`, `this_month`, `this_year`                       |
| `trend`         | string | `daily` (last 30 days, default) or `monthly` (last 12 months)              |

**Response `200`**

```json
{
  "counts": {
    "total_vendors": 5,
    "total_equipment": 42,
    "equipment_by_owner": { "vendor_owned": 30, "facility_owned": 12 },
    "equipment_by_linkage": { "linked": 27, "not_linked": 15 },
    "equipment_connectivity": { "live": 9, "linked": 27, "never_connected": 15, "total": 42 },
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
  "booking_trend": {
    "granularity": "daily",
    "buckets": 30,
    "total": 156,
    "points": [
      { "bucket": "2026-08-26", "label": "26 Aug", "count": 4 },
      { "bucket": "2026-08-27", "label": "27 Aug", "count": 7 }
    ]
  },
  "efficiency": {
    "period_days": 30, "total_scheduled": 200,
    "total_completed": 156, "total_cancelled": 12,
    "completion_rate": 78.0,
    "daily_breakdown": [...]
  }
}
```

`counts.equipment_connectivity` is the connectivity card. The three numbers are
not mutually exclusive — **`live` is a subset of `linked`**:

| Field | Meaning |
| ----- | ------- |
| `live` | Connected right now (`is_connected`) |
| `linked` | Has reported at least once (`last_seen_at` is set) — keeps the same meaning as `?linked=true` on the equipment listings |
| `never_connected` | Never heard from; these are the un-pingable units |
| `total` | `linked + never_connected` |

The same card appears as `equipment.by_connectivity` on
`GET /vendor/dashboard` and `GET /facility/dashboard`.

---

### GET `/admin/equipment`

Paginated equipment listing with modality, category, status, search, vendor and facility filters.

**Query Parameters**

| Param         | Type    | Default | Values                                                                                        |
| ------------- | ------- | ------- | --------------------------------------------------------------------------------------------- |
| `modality`    | string  | —       | `CT`, `DX`, `MR`, `US`, `MG`, `NM`, `PT`, `XA`, `RF`, `ECG`, `RTPLAN`, `RTSIM`, `non_imaging` |
| `category`    | string  | —       | Any equipment category value                                                                  |
| `status`      | string  | —       | Any equipment status value                                                                    |
| `search`      | string  | —       | Free-text search                                                                              |
| `vendor_id`   | uuid    | —       |                                                                                               |
| `facility_id` | uuid    | —       | Owning facility                                                                               |
| `keph_level`  | string  | —       | Owning facility's KEPH level (case-insensitive)                                               |
| `linked`      | boolean | —       | `true` = seen on the network (`last_seen_at` set), `false` = never seen                        |
| `sort_by`     | string  | `name`  | `name`, `code`, `category`, `status`, `created_at`                                            |
| `sort_order`  | string  | `asc`   | `asc`, `desc`                                                                                 |
| `per_page`    | integer | 15      | 1–100                                                                                         |

---

### GET `/admin/facility-readiness`

The follow-up report: every facility with the equipment installed there —
vendor-owned or facility-owned — judged on four **evidence-based** checks and
annotated with the notes a follow-up needs.

**Checks**

| Check | True when |
| ----- | --------- |
| `linked` | The machine has reached VEMS at least once (`last_seen_at` is set) |
| `live` | It is connected right now (`is_connected`) |
| `worklist_ready` | It has actually pulled a worklist — a C-FIND was logged, a test probe returned, or the machine performed a production order |
| `results_ready` | It has actually returned a study — a study send was logged, a worklist result arrived, or a non-SHA study was recorded |

A machine that is online but has no worklist/study evidence is **not** worklist-
or results-ready, however good its configuration looks. Each equipment row
carries `notes` — one per blocker, most fundamental first — saying what it would
take to get it fully working (e.g. *“No end-to-end test exists yet. Create an
MWL test worklist and run a C-FIND from the machine…”*).

**Readiness levels**

| Level | Meaning |
| ----- | ------- |
| `ready` | All four checks pass and the equipment status is `active` |
| `attention` | A known machine with something missing — offline, untested, in maintenance, or not yet proven in production |
| `not_ready` | Never linked (nothing to test yet) or decommissioned |

**Query Parameters**

| Param            | Type    | Notes |
| ---------------- | ------- | ----- |
| `county_id`      | uuid    | |
| `facility_id`    | uuid    | Single facility |
| `facility_type`  | string  | |
| `keph_level`     | string  | Facility KEPH level (case-insensitive) |
| `search`         | string  | Facility name/FR code, or any of its equipment's name/code/AE title |
| `vendor_id`      | uuid    | Only facilities with equipment from this vendor |
| `ownership_type` | string  | `facility`, `vendor` |
| `status`         | string  | Equipment status value |
| `readiness`      | string  | `ready`, `attention`, `not_ready` |
| `linked`         | boolean | `true` = seen on the network, `false` = never seen |
| `is_connected`   | boolean | `true` = live now, `false` = not connected |
| `per_page`       | integer | Facilities per page, 1–100 (default 20) |

The response is paginated **by facility**. `summary` counts every facility
matching the filters, not just the page. `data[].summary` rolls up the
equipment shown beneath each facility.

**Response `200`**

```json
{
  "summary": {
    "total": 42,
    "by_ownership": { "vendor": 30, "facility": 12 },
    "by_check": { "linked": 27, "live": 9, "worklist_ready": 14, "results_ready": 11 },
    "by_readiness": { "ready": 8, "attention": 19, "not_ready": 15 }
  },
  "data": [
    {
      "facility": {
        "id": "...", "name": "Bondo Sub-County Hospital",
        "fr_code": "FID-34-115630-8", "keph_level": "Level 4",
        "facility_type": "HOSPITAL", "county": { "id": "...", "name": "Siaya", "code": "34" }
      },
      "summary": {
        "total": 3,
        "by_readiness": { "ready": 1, "attention": 2, "not_ready": 0 },
        "by_ownership": { "vendor": 2, "facility": 1 },
        "by_check": { "linked": 3, "live": 2, "worklist_ready": 1, "results_ready": 1 }
      },
      "equipment": [
        {
          "id": "...", "code": "FID341156308CT", "name": "Siemens CT",
          "modality": "CT", "status": "active", "status_label": "Active",
          "ownership_type": "vendor",
          "vendor": { "id": "...", "name": "Melco Kenya Ltd", "code": "VEN001" },
          "dicom": { "ae_title": "CT01", "host": "10.0.0.5", "port": 104 },
          "checks": { "linked": true, "live": true, "worklist_ready": true, "results_ready": false },
          "tests": { "total": 2, "succeeded": 1, "awaiting_result": 1, "last_tested_at": "...", "last_accession_number": "ACC202609240001" },
          "activity": {
            "last_seen_at": "...", "connected_at": "...",
            "last_worklist_pull_at": "...", "last_study_sent_at": "...",
            "orders_performed": 3, "results_received": 1, "unmatched_studies": 0
          },
          "readiness": "attention", "ready": false, "score": 3,
          "notes": [
            { "level": "warning", "code": "results_never_returned", "message": "Worklists are delivered, but no study has ever been sent back — acquire a study and confirm the C-STORE destination (AE title, host and port) points at VEMS." }
          ]
        }
      ]
    }
  ],
  "pagination": { "current_page": 1, "per_page": 20, "total": 18, "total_pages": 1 },
  "filters": { "available": { "county": [], "facility_type": [], "vendor": [], "status": [], "readiness": [], "linked": [] }, "applied": {} }
}
```

Note codes on `notes[]`: `decommissioned`, `pending_installation`,
`under_maintenance`, `inactive`, `never_linked`, `not_live`,
`no_end_to_end_test`, `worklist_never_pulled`, `results_never_returned`,
`non_sha_studies`.

---

### GET `/admin/facility-ranking`

Facilities ranked by booking volume, each with its booking status breakdown,
completion rate, and the non-SHA studies performed on its equipment with no
order behind them.

`completion_rate` = completed ÷ (total − cancelled). A cancelled booking was
never expected to complete, so it is not counted against the facility.
`pending` is `pending_otp + active`. `non_sha_studies` counts studies recorded
on the facility's machines that were never initiated from a booking.

**Query Parameters**

| Param           | Type    | Notes |
| --------------- | ------- | ----- |
| `period`        | string  | `7d`, `30d`, `90d`, `12m`, `this_month`, `this_year` (applies to `bookings.created_at` and `unmatched_studies.received_at`; default all time) |
| `county_id`     | uuid    | |
| `facility_id`   | uuid    | Single facility |
| `facility_type` | string  | |
| `keph_level`    | string  | Facility KEPH level (case-insensitive) |
| `search`        | string  | Facility name or FR code |
| `is_active`     | boolean | |
| `sort_by`       | string  | `total_bookings` (default), `patients`, `completed`, `completion_rate`, `cancelled`, `non_sha_studies` |
| `sort_order`    | string  | `asc`, `desc` (default) |
| `per_page`      | integer | Facilities per page, 1–100 (default 20) |

Rank is assigned over the whole filtered set, so it stays stable across pages;
`summary` likewise counts every facility in the ranking, not just the page.

**Response `200`**

```json
{
  "summary": {
    "facilities": 18, "total_bookings": 340, "completed": 300, "pending": 20,
    "cancelled": 20, "completion_rate": 93.8, "patients": 280,
    "non_sha_studies": 15,
    "top_facility": { "id": "...", "name": "Bondo Sub-County Hospital", "total_bookings": 96 }
  },
  "data": [
    {
      "rank": 1,
      "facility": {
        "id": "...", "name": "Bondo Sub-County Hospital",
        "fr_code": "FID-34-115630-8", "keph_level": "Level 4",
        "facility_type": "HOSPITAL", "county": { "id": "...", "name": "Siaya", "code": "34" }
      },
      "bookings": {
        "total": 96, "pending": 4, "completed": 90, "cancelled": 2,
        "by_status": { "pending_otp": 2, "active": 2, "completed": 90, "cancelled": 2 },
        "by_source": { "standalone": 60, "hmis": 30, "provider_portal": 6 },
        "completion_rate": 95.7, "patients": 81,
        "last_booking_at": "2026-09-25T14:12:00+03:00"
      },
      "non_sha_studies": { "total": 4, "last_received_at": "2026-09-24T09:30:00+03:00" }
    }
  ],
  "pagination": { "current_page": 1, "per_page": 20, "total": 18, "total_pages": 1 },
  "filters": { "available": { "county": [], "facility_type": [], "period": [], "sort_by": [], "sort_order": [] }, "applied": {} }
}
```

---

### Analytics Endpoints

All analytics require authentication.

| Endpoint                                          | Description                            |
| ------------------------------------------------- | -------------------------------------- |
| `GET /analytics/vendors/by-equipments`            | Vendor ranking by equipment count      |
| `GET /analytics/vendors/by-facilities-supporting` | Vendor ranking by facilities supported |
| `GET /analytics/vendors/by-procedures`            | Vendor ranking by procedures performed |
| `GET /analytics/vendors/by-procedure-type`        | Vendor breakdown by procedure type     |
| `GET /analytics/facilities/by-procedures`         | Facility ranking by procedures         |
| `GET /analytics/facilities/by-procedure-type`     | Facility breakdown by procedure type   |
| `GET /analytics/facilities/by-vendor`             | Facility ranking by vendors engaged    |
| `GET /analytics/reports/procedure-costs`          | Procedure cost report                  |
| `GET /analytics/reports/procedure-costs/export`   | Export procedure cost report           |

Procedure analytics accept `start_time`, `end_time`, and `procedure_type` query params. Cost reports accept `vendor`, `facility`, `equipment`, `modality`, `procedure`, `status`, `start_date`, `end_date`.

---

## 22. Users & Permissions (Admin)

Admin user and permission management. **Auth required.**

### GET `/users/roles`

The roles the caller is allowed to assign, for the role picker on the user form.
A facility admin (`f_admin`) gets only their four assignable roles; a
system-level admin gets every role.
**Response `200`**

```json
{
  "data": [
    { "value": "f_finance", "label": "Finance Manager", "type": "facility" },
    { "value": "f_practitioner", "label": "Practitioner", "type": "facility" },
    { "value": "f_equipment_user", "label": "Equipment User", "type": "facility" },
    { "value": "f_view_only", "label": "View Only", "type": "facility" }
  ],
  "scope": "facility"
}
```

`scope` is `facility` or `system`. `f_equipment_user` is the spelling to use for
the role value; `type` is one of `system`, `vendor`, `facility`.

---

### GET `/users` (Admin scope)

List users with pagination and filtering.

A system-level admin sees every user. A facility admin (`f_admin`) sees only
users belonging to their own facility; any `facility_id` they pass is ignored.

| Param       | Type    | Notes             |
| ----------- | ------- | ----------------- |
| `is_active` | boolean |                   |
| `search`    | string  |                   |
| `role`      | string  | Any `UserRole` value |
| `vendor_id` | uuid    | Users of this vendor |
| `facility_id` | uuid  | Users of this facility |
| `keph_level` | string | Users whose facility is at this KEPH level (case-insensitive) |
| `page`      | integer | Default 1         |
| `page_size` | integer | 1–100, default 20 |

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "jane@hospital.co.ke",
      "phone": "+254700000000",
      "role": "f_admin",
      "role_label": "Facility Admin",
      "is_active": true,
      "institution": {
        "type": "facility",
        "id": "uuid",
        "code": "KNH",
        "name": "Kenyatta National Hospital"
      },
      "created_at": "2025-01-01T00:00:00+03:00",
      "updated_at": "2025-01-01T00:00:00+03:00"
    }
  ],
  "pagination": { "current_page": 1, "per_page": 20, "total": 50, "total_pages": 3 }
}
```

---

### POST `/users`

Create a new user.

| Field                   | Type    | Required | Notes                                    |
| ----------------------- | ------- | -------- | ---------------------------------------- |
| `name`                  | string  | Yes      | Max 255 chars                            |
| `email`                 | email   | Yes*     | Unique                                   |
| `phone`                 | string  | Yes*     | Max 20 chars, unique                     |
| `role`                  | string  | Yes      | Any `UserRole` value (see scope below)   |
| `is_active`             | boolean | No       | Default `true`                           |
| `salutation`            | string  | No       | Max 20 chars                             |
| `gender`                | string  | No       | `male`, `female`, `other`                |
| `professional_id`       | string  | No       | Max 50 chars                             |
| `registration_id`       | string  | No       | Max 50 chars                             |
| `identification_type`   | string  | No       | Max 50 chars                             |
| `identification_number` | string  | No       | Max 50 chars                             |
| `postal_address`        | array   | No       |                                          |
| `facility_id`           | uuid    | Cond.    | Required for facility roles (system admin) |
| `vendor_id`             | uuid    | Cond.    | Required for vendor roles                |

\* At least one of `email` or `phone` is required.

**Role scope**

| Caller                                      | Roles that may be created                                                                     | Facility                                     |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------- |
| System admin (`admin`, `nesp`, `moh`, `cog`) | Any role                                                                                       | Supplied `facility_id` / `vendor_id`         |
| Facility admin (`f_admin`)                   | `f_view_only`, `f_practitioner`, `f_finance`, `f_equipment_user` — never `f_admin` or system/vendor roles | Forced from the caller's profile; `facility_id` and `vendor_id` are rejected |

**The account is handed over by email.** No password is accepted or returned —
the user is created with a random one nobody is told, and a welcome mail carrying
a single-use link is queued so they set their own. The response reports whether
it went:

```json
{ "data": { "id": "uuid", "email": "jane@hospital.co.ke", "welcome_email_sent": true, "...": "..." } }
```

`welcome_email_sent` is `false` only when there is no email on file. Through this
endpoint that cannot happen — `email` is required — but imported rows can lack
one, and the field makes the outcome visible rather than assumed.

> **`true` means queued, not delivered.** For the mail to actually arrive, two
> further things must be true: a queue worker must be running against the
> connection in `QUEUE_CONNECTION`, and `MAIL_MAILER` must be a real transport.
> With the default `MAIL_MAILER=log` the message is written to
> `storage/logs/laravel.log` and never sent — which looks exactly like a mail
> that was sent and lost. Which of the two happened is one command:
>
> ```bash
> grep -c "activate your account" storage/logs/laravel.log
> ```
>
> A count above zero means the whole chain worked and only the mailer is wrong.

### POST `/users/{user_id}/password-reset-link`

Send an existing account a fresh reset link. For when someone cannot get far
enough to request one themselves — a new starter whose welcome mail bounced, or
a colleague who is locked out.

The same rules as role scope above apply, decided by **rank**: the caller must
outrank the target, and a facility admin must share its facility. A peer is out
of reach, so an HRIO cannot reset another HRIO's password, and nobody can reset
theirs above their own level.

```json
{ "data": { "email": "jane@hospital.co.ke" }, "message": "A password reset link has been sent to jane@hospital.co.ke." }
```

**`403`** — target out of reach. **`404`** — no such user.
**`422`** — the account has no email address, so there is nowhere to send it.

#### Role rank

`manage users under their level` is decided by a single rank per role, so a new
role slots in by being given a rank rather than by editing each controller.

| Rank | Roles |
| ---- | ----- |
| 100 | `admin` |
| 90 | `nesp`, `moh`, `cog` |
| 80 | `payer`, `provider_portal`, `hmis` |
| 50 | `vendor` |
| 40 | `f_admin` (HRIO) |
| 30 | `f_finance`, `f_practitioner` |
| 20 | `f_equipment_user` |
| 10 | `f_view_only` |

A role may manage anything ranked **strictly below** it, so peers cannot manage
each other. The exception is the system-admin tier, which keeps the run of the
estate — including its own peers — exactly as before. `GET /users/roles` returns
the resulting list for whoever is asking, so the frontend never hardcodes it.

---

### GET `/users/{user_id}`

Get user by ID. A facility admin may only fetch users belonging to their own
facility — any other user returns `404`.

**Response `200`**

```json
{
  "data": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@hospital.co.ke",
    "phone": "+254700000000",
    "role": "f_admin",
    "role_label": "Facility Admin",
    "is_active": true,
    "email_verified_at": "2025-01-01T00:00:00+03:00",
    "profile": {
      "id": "uuid",
      "salutation": "Dr.",
      "gender": "female",
      "professional_id": "R/12345",
      "registration_id": "KMPDC/2020/00123",
      "identification_type": "National ID",
      "identification_number": "12345678",
      "postal_address": null,
      "vendor": null,
      "facility": { "id": "uuid", "name": "Kenyatta National Hospital" }
    },
    "created_at": "2025-01-01T00:00:00+03:00",
    "updated_at": "2025-01-01T00:00:00+03:00"
  }
}
```

**Response `404`** — User not found.

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

| Param       | Type    | Notes             |
| ----------- | ------- | ----------------- |
| `is_active` | boolean |                   |
| `search`    | string  |                   |
| `page`      | integer | Default 1         |
| `page_size` | integer | 1–100, default 20 |

#### POST `/admin/permissions`

Create a permission.

| Field         | Type    | Required | Notes              |
| ------------- | ------- | -------- | ------------------ |
| `code`        | string  | Yes      | 3–50 chars, unique |
| `name`        | string  | Yes      | 1–150 chars        |
| `description` | string  | No       |                    |
| `resource`    | string  | Yes      | 1–100 chars        |
| `action`      | string  | Yes      | 1–50 chars         |
| `is_active`   | boolean | No       | Default `true`     |

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

| Field        | Type   | Required | Notes         |
| ------------ | ------ | -------- | ------------- |
| `granted_by` | string | No       | Admin user ID |

#### DELETE `/admin/users/{user_id}/permissions/{permission_id}`

Unassign a permission from a user. Returns `204`.

---

## 23. Revenue Distributions (Settings)

Manage revenue share distribution periods between vendors and facilities. **Auth required.**

### GET `/settings/revenue-distributions`

List active revenue distribution periods.

**Response `200`**

```json
{
  "data": [
    {
      "id": "uuid",
      "vendor_percentage": 60.00,
      "facility_percentage": 40.00,
      "start_date": "2025-01-01",
      "end_date": "2025-12-31",
      "active": true,
      "created_at": "2025-01-01T00:00:00+03:00",
      "updated_at": "2025-01-01T00:00:00+03:00"
    }
  ],
  "pagination": { "current_page": 1, "per_page": 20, "total": 3, "total_pages": 1 }
}
```

---

### POST `/settings/revenue-distributions`

Create a revenue distribution period.

| Field                 | Type    | Required | Notes          |
| --------------------- | ------- | -------- | -------------- |
| `vendor_percentage`   | number  | Yes      | 0–100          |
| `facility_percentage` | number  | Yes      | 0–100          |
| `start_date`          | date    | Yes      |                |
| `end_date`            | date    | Yes      |                |
| `active`              | boolean | No       | Default `true` |

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

| Code                        | Meaning                                                |
| --------------------------- | ------------------------------------------------------ |
| `VALIDATION_ERROR`          | Request body failed validation — check `errors` object |
| `INVALID_SERVICES`          | All services in the request are invalid                |
| `SERVICE_NOT_FOUND`         | `contract_service_id` does not exist                   |
| `SERVICE_FACILITY_MISMATCH` | Service does not belong to the selected facility       |
| `CONTRACT_INACTIVE`         | The service's contract is not active                   |
| `SERVICE_INACTIVE`          | The specific service is disabled                       |
| `EQUIPMENT_UNAVAILABLE`     | Equipment linked to service is not active              |
| `NO_VALID_SERVICES`         | No services could be booked — full rollback            |
| `SESSION_EXPIRED`           | OTP session has timed out                              |
| `MAX_ATTEMPTS_EXCEEDED`     | Too many wrong OTP attempts — session locked           |
| `MAX_RESENDS_EXCEEDED`      | Too many OTP resend requests                           |
| `SERVICE_ALREADY_COMPLETED` | Cannot act on an already-completed service             |
| `SERVICE_CANCELLED`         | Cannot act on a cancelled service                      |
| `AMOUNT_MISMATCH`           | Finance breakdown totals do not equal the tariff       |

### HTTP Status Codes

| Status | When                                         |
| ------ | -------------------------------------------- |
| `200`  | Success (GET, updates)                       |
| `201`  | Created (POST — new resource)                |
| `400`  | Business rule violation                      |
| `401`  | Missing or invalid token                     |
| `403`  | Account inactive or insufficient permissions |
| `404`  | Resource not found                           |
| `409`  | Conflict (e.g., patient already exists)      |
| `410`  | Gone — session expired or consumed           |
| `422`  | Validation failed                            |
| `429`  | Rate limited                                 |
| `500`  | Server error                                 |

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
