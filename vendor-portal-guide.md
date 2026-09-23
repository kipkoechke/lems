# Vendor Portal — Frontend Integration Guide

## Overview

The VEMS Vendor Portal provides equipment vendors with a dedicated interface to manage their DICOM medical imaging equipment, test connectivity, monitor bookings, and view revenue dashboards.

All vendor endpoints live under `/api/v1/vendor` and require authentication via Sanctum with the `vendor` role.

---

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/login` | Login with email/password. Returns Bearer token. |
| `POST` | `/api/v1/auth/logout` | Invalidate current token. |
| `GET` | `/api/v1/auth/me` | Get current user profile (includes vendor info). |

**Response** from `/api/v1/auth/me` includes the vendor profile:

```json
{
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@vendor.com",
    "role": "vendor",
    "vendor": {
      "id": "uuid",
      "name": "Melco Kenya Ltd",
      "code": "VEN001"
    }
  }
}
```

---

## Equipment Management

### 1. List My Equipment

`GET /api/v1/vendor/equipments`

Lists all equipment belonging to the authenticated vendor. The vendor is resolved from `auth/me` — no vendor ID needed in the URL.

**Query Parameters (all optional):**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name, code, AE title, or serial number |
| `category` | string | Filter by EquipmentCategory value (e.g. `xray_digital`, `ct_scanner_multi_slice`) |
| `status` | string | Filter by EquipmentStatus value (e.g. `active`, `inactive`, `maintenance`) |
| `sort_by` | string | `name`, `code`, `status`, or `created_at` (default: `name`) |
| `sort_order` | string | `asc` or `desc` (default: `asc`) |
| `per_page` | int | 1-100 (default: 20) |

**Response includes `available_filters`** — use these to populate dropdown/select UI controls:

```json
{
  "data": [
    {
      "id": "uuid",
      "code": "FID341156308CT",
      "name": "Digital X-Ray System — Facility Name",
      "serial_number": "SN-12345",
      "model": "Model X",
      "brand": "Brand Y",
      "category": "xray_digital",
      "category_label": "Digital X-Ray",
      "modality": "DX",
      "status": "active",
      "status_label": "Active",
      "ae_title": "FID341156308CT",
      "host": "197.248.54.223",
      "dicom_port": 11112,
      "is_connected": true,
      "last_seen_at": "2026-07-16T10:30:00+00:00",
      "connected_at": "2026-07-15T08:00:00+00:00",
      "facility": {
        "id": "uuid",
        "name": "Kitengela Sub-County Hospital",
        "fr_code": "FID-34-115630-8"
      },
      "manufacture_date": "2025-01-01",
      "created_at": "2026-07-14T12:00:00+00:00"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 20,
    "total": 7
  },
  "available_filters": {
    "status": [
      { "value": "active", "label": "Active" },
      { "value": "inactive", "label": "Inactive" },
      { "value": "maintenance", "label": "Under Maintenance" },
      { "value": "decommissioned", "label": "Decommissioned" },
      { "value": "pending_installation", "label": "Pending Installation" }
    ],
    "category": [
      { "value": "xray_digital", "label": "Digital X-Ray" },
      { "value": "ct_scanner_multi_slice", "label": "Multi-Slice CT Scanner" }
    ],
    "sort_by": [
      { "value": "name", "label": "Name" },
      { "value": "code", "label": "Code" },
      { "value": "status", "label": "Status" },
      { "value": "created_at", "label": "Date Created" }
    ],
    "sort_order": [
      { "value": "asc", "label": "Ascending" },
      { "value": "desc", "label": "Descending" }
    ]
  }
}
```

**UI Guidance:**
- Show a filter bar with search input + category/status dropdowns populated from `available_filters`
- Each equipment card/row should show: code, name, modality badge, status badge, connectivity indicator (green/red dot)
- Clicking an equipment navigates to its detail page

---

### 2. View Equipment Detail

`GET /api/v1/vendor/equipments/{equipmentId}`

Returns full equipment details including connection and facility info.

**UI Guidance:**
- Show all equipment metadata (code, serial, model, brand, category, modality)
- Show facility info (name, FR code)
- Show connection card with AE title, IP, port, and `is_connected` status
- Action buttons: Configure, Test Connection, View DICOM Status

---

### 3. Configure DICOM Connection

`POST /api/v1/vendor/equipments/{equipmentId}/configure`

Set the equipment's DICOM AE title, IP address, and port. Also registers the equipment in Orthanc.

**Request Body:**

```json
{
  "ae_title": "FID341156308CT",
  "ip": "197.248.54.223",
  "port": 11112
}
```

| Field | Rules |
|-------|-------|
| `ae_title` | Required, string, max 16 chars |
| `ip` | Required, string (IPv4 or hostname) |
| `port` | Required, integer, 1-65535 |

**Response (200):** Registration succeeded.
**Response (207):** Saved but Orthanc registration failed (check Orthanc connectivity).

**UI Guidance:**
- Form with 3 fields: AE Title, IP Address, Port
- Pre-fill from existing equipment data if available
- `ae_title` should auto-uppercase on submit
- Show connection instructions after successful save:
  > Configure your modality with these settings:
  > - **MWL Server AET:** VEMSSCP
  > - **MWL Server IP:** {server_ip}
  > - **MWL Server Port:** 4242
  > - **Your AE Title:** {ae_title}

---

### 4. Test Connection (C-ECHO)

`POST /api/v1/vendor/equipments/{equipmentId}/test-connection`

Requires equipment to be configured first (ae_title + ip). Sends a DICOM C-ECHO to verify the device is reachable.

**Response:**

```json
{
  "data": {
    "ae_title": "FID341156308CT",
    "host": "197.248.54.223",
    "port": 11112,
    "registered": true,
    "echo_success": true,
    "is_connected": true,
    "message": "C-ECHO successful — device is online."
  }
}
```

**UI Guidance:**
- Button: "Test Connection" — requires equipment to be configured first
- Show spinner during test (can take 5-15 seconds)
- Success: green checkmark + "Device is online"
- Failure: yellow warning + "C-ECHO failed — device may be off or unreachable"
- Update the connectivity indicator on the equipment card after test

---

### 5. DICOM Status

`GET /api/v1/vendor/equipments/{equipmentId}/dicom-status`

Returns the full DICOM connection state including Orthanc registration status and MWL server configuration.

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "name": "Digital X-Ray System — Facility",
    "code": "FID341156308CT",
    "ae_title": "FID341156308CT",
    "host": "197.248.54.223",
    "port": 11112,
    "registered_in_orthanc": true,
    "is_connected": true,
    "last_seen_at": "2026-07-16T10:30:00+00:00",
    "connected_at": "2026-07-15T08:00:00+00:00",
    "vendor_config": {
      "mwl_server_aet": "VEMSSCP",
      "mwl_server_ip": "192.168.100.6",
      "mwl_server_port": 4242,
      "equipment_aet": "FID341156308CT"
    }
  }
}
```

**UI Guidance:**
- Display as a "Connection Status" card showing:
  - Orthanc Registration: ✅/❌
  - C-ECHO / Connected: ✅/❌ (green if `is_connected`)
  - Last Seen: timestamp
  - Connected Since: timestamp
- Show the `vendor_config` as a "MWL Configuration" reference card — these are the settings the vendor enters on their modality console

---

## Worklist Testing

### 6. Send Test Worklist

`POST /api/v1/vendor/worklist-test`

Creates a fake DICOM MWL entry in Orthanc so the vendor can verify end-to-end connectivity.

**Request Body:**

```json
{
  "equipment_id": "uuid",
  "accession_number": "TEST001",
  "patient_id": "PAT001",
  "patient_name": "Doe^John"
}
```

| Field | Rules |
|-------|-------|
| `equipment_id` | Required, UUID, must belong to vendor |
| `accession_number` | Optional, auto-generated if omitted |
| `patient_id` | Optional, defaults to "VEMS_TEST_PATIENT" |
| `patient_name` | Optional, defaults to "Test^Patient" |

**Response includes `mwl_instructions`:**

```json
{
  "message": "Test worklist created. Query it from your modality using C-FIND MWL.",
  "data": {
    "orthanc_worklist_id": "uuid",
    "accession_number": "MWL_TEST_20260716_103000_FID3411",
    "equipment": {
      "id": "uuid",
      "code": "FID341156308CT",
      "name": "Digital X-Ray System — Facility",
      "ae_title": "FID341156308CT"
    },
    "mwl_instructions": {
      "method": "C-FIND MWL (DICOM Modality Worklist)",
      "query_key": "AccessionNumber",
      "query_value": "MWL_TEST_20260716_103000_FID3411",
      "server_aet": "VEMSSCP",
      "server_host": "192.168.100.6",
      "server_port": 4242
    },
    "next_step": "Perform a C-FIND MWL query from your modality using the AccessionNumber above. After acquiring the study and sending it back, the Lua callback notifies VEMS automatically."
  }
}
```

**UI Guidance — Full Test Flow:**
1. Vendor selects equipment from dropdown
2. Clicks "Send Test Worklist"
3. UI displays the `mwl_instructions` — copy-paste ready for the vendor
4. Vendor configures their modality with the MWL server settings
5. Vendor performs C-FIND with the `AccessionNumber`
6. If successful, the worklist appears on the modality console
7. Vendor acquires the study → C-STORE to Orthanc → Lua callback notifies VEMS
8. VEMS updates booking/request status → visible in dashboard

---

## Bookings

### 7. My Bookings

`GET /api/v1/vendor/bookings`

Lists all booked services for the vendor's equipment across all facilities.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `service_status` | string | `pending`, `in_progress`, `completed`, `cancelled` |
| `booking_status` | string | `pending`, `confirmed`, `completed`, `cancelled` |
| `from` | date | Filter from date (YYYY-MM-DD) |
| `to` | date | Filter to date (YYYY-MM-DD) |
| `search` | string | Search by booking number or patient name |
| `per_page` | int | 1-100 (default: 20) |

**Response includes `available_filters`** for populating status dropdowns.

**UI Guidance:**
- Table/list view showing: booking number, patient name, facility, service, status, amount, vendor share
- Filter bar with date range picker + status dropdowns (populated from `available_filters`)
- Each row clickable → booking detail

---

## Dashboard

### 8. Vendor Dashboard

`GET /api/v1/vendor/dashboard`

Aggregated stats for the vendor's operations.

**Response:**

```json
{
  "data": {
    "vendor": {
      "id": "uuid",
      "name": "Melco Kenya Ltd",
      "code": "VEN001",
      "email": "melco@example.com"
    },
    "equipment": {
      "total": 6,
      "by_status": {
        "active": 4,
        "maintenance": 1,
        "pending_installation": 1
      }
    },
    "bookings": {
      "total_bookings": 42,
      "total_services": 156,
      "unique_patients": 38
    },
    "revenue": {
      "total_tariff": 1250000.00,
      "vendor_share": 375000.00,
      "by_payment_type": {
        "sha": 250000.00,
        "cash": 100000.00,
        "other_insurance": 25000.00
      }
    },
    "facilities_served": [
      { "id": "uuid", "name": "Kitengela Sub-County Hospital", "fr_code": "FID-34-115630-8" }
    ],
    "lots_covered": [
      { "number": "1", "name": "Diagnostics Imaging X-ray" },
      { "number": "4", "name": "Diagnostics Imaging CT" }
    ]
  }
}
```

**UI Guidance:**
- Cards at top: Total Equipment, Active Equipment, Total Bookings, Total Revenue
- Equipment status breakdown as pie/bar chart
- Revenue breakdown by payment type as donut chart
- Facilities served as a list with counts
- Lots covered as badge pills

---

## Vendor Onboarding Checklist (UI Flow)

The vendor should complete these steps in order for each equipment:

### Step 1: View Equipment List
→ `GET /vendor/equipments`
- Equipment appears here after `vems:setup-imaging` or auto-discovery

### Step 2: Configure DICOM
→ `POST /vendor/equipments/{id}/configure`
- Enter the equipment's AE title, IP address, and DICOM port
- These values come from the equipment's DICOM configuration console

### Step 3: Test Connection
→ `POST /vendor/equipments/{id}/test-connection`
- If C-ECHO succeeds → ✅ Connected
- If C-ECHO fails → check IP/port/firewall, retry

### Step 4: Verify DICOM Status
→ `GET /vendor/equipments/{id}/dicom-status`
- Confirm `registered_in_orthanc: true`
- Note the `vendor_config` values for modality setup

### Step 5: End-to-End MWL Test
→ `POST /vendor/worklist-test`
- Creates a test worklist
- Vendor queries it from their modality
- Acquires study → C-STORE back → Lua callback confirms end-to-end

### Step 6: Monitor Dashboard
→ `GET /vendor/dashboard`
- Track bookings, revenue, and equipment status over time

---

## Connection States Reference

| State | `is_connected` | `registered_in_orthanc` | What it means |
|-------|---------------|------------------------|---------------|
| **Not Configured** | false | false | Equipment has no AE title/IP — configure it first |
| **Configured** | false | true | Saved in Orthanc but C-ECHO failed or not tested |
| **C-ECHO OK** | true | true | Equipment is online and reachable |
| **Auto-Pinged** | true | true | Equipment queried MWL or sent study — confirmed active |

Auto-ping happens automatically when the equipment queries Orthanc for MWL or sends a C-STORE. No manual action needed.

---

## Admin Endpoints (for reference)

Admins use separate endpoints under `/api/v1/admin` and `/api/v1/vendors`:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/vendors` | List all vendors |
| `GET` | `/api/v1/vendors/{vendor}/equipments` | View vendor's equipment |
| `POST` | `/api/v1/vendors/{vendor}/equipments` | Add equipment to vendor |
| `GET` | `/api/v1/vendors/{vendor}/bookings` | View vendor's bookings |
| `GET` | `/api/v1/vendors/{vendor}/dashboard` | Vendor dashboard |
| `GET` | `/api/v1/dicom/server/status` | Orthanc server health |
| `GET` | `/api/v1/dicom/modalities` | List registered modalities |
| `POST` | `/api/v1/dicom/equipment/{id}/register` | Register equipment in Orthanc |
| `DELETE` | `/api/v1/dicom/equipment/{id}/register` | Unregister from Orthanc |
| `GET` | `/api/v1/dicom/events/ping-events` | View DICOM ping events |
| `GET` | `/api/v1/dicom/dead-letters` | View failed DICOM events |
