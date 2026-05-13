# VEMS API Reference — v1

**Base URL:** `https://{APP_DOMAIN}/api/v1`

All requests and responses use `application/json`. Authenticated endpoints require the `Authorization: Bearer {token}` header obtained from the login endpoint.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Patients](#2-patients)
3. [Places](#3-places)
4. [Equipment (Vendors & Onboarding)](#4-equipment-vendors--onboarding)
5. [Bookings — Standard Flow (OTP)](#5-bookings--standard-flow-otp)
6. [Bookings — Direct / Override](#6-bookings--direct--override)
7. [Booking Actions](#7-booking-actions)
8. [Provider Portal](#8-provider-portal)
9. [Payer Validation](#9-payer-validation)
10. [Error Reference](#10-error-reference)

---

## 1. Authentication

### POST `/auth/login`

Authenticates a user and returns a bearer token.

**Request Body**

| Field      | Type   | Required | Notes                                          |
| ---------- | ------ | -------- | ---------------------------------------------- |
| `login`    | string | Yes\*    | Email or phone. Use either `login` or `email`. |
| `email`    | string | Yes\*    | Alias for `login`.                             |
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

## 4. Equipment (Vendors & Onboarding)

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

## 5. Bookings — Standard Flow (OTP)

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

## 6. Bookings — Direct / Override

### GET `/bookings`

List bookings. Returns a summary alongside paginated results.

**Query Parameters**

| Param              | Type    | Notes                                             |
| ------------------ | ------- | ------------------------------------------------- |
| `fr_code`          | string  | Filter by facility FR code                        |
| `facility_id`      | uuid    |                                                   |
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

## 7. Booking Actions

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
      "sha": 3000.0,
      "cash": 500.0,
      "other_insurance": 0.0
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

## 8. Provider Portal

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
      "amount": 3500.0,
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
          "tariff": 3500.0,
          "vendorPercentage": 60,
          "facilityPercentage": 40
        },
        "payment": {
          "cash": 500.0,
          "sha": 3000.0
        },
        "breakdown": {
          "cash": { "vendor": 300.0, "facility": 200.0 },
          "sha": { "vendor": 1800.0, "facility": 1200.0 }
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

## 9. Payer Validation

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
    "total_tariff": 7000.0,
    "total_sha": 6000.0,
    "total_cash": 1000.0,
    "other_insurance": 0.0,
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
        "tariff": 3500.0,
        "sha": 3000.0,
        "cash": 500.0,
        "vendor_share": 2100.0,
        "facility_share": 1400.0
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

## 10. Error Reference

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
