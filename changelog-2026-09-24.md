# API Changelog — 2026-09-24

Frontend-facing changes in this development cycle (commits `4e90369` → `3e02a1d`).

Everything is under `/api/v1` and requires a Sanctum bearer token unless stated
otherwise. Full request/response detail lives in `docs/api-reference.md`.

**Deploy prerequisites:** two migrations must run —
`add_study_metadata_to_equipment_work_lists_table` and
`create_device_activity_logs_table`.

---

## Summary

| # | Change | Type |
| - | ------ | ---- |
| 1 | Facility Portal equipment endpoints | New |
| 2 | `f_view_only` role | New |
| 3 | `GET /users/roles` role-options endpoint | New |
| 4 | Facility admins (HRIO) can manage their own facility's users | Changed |
| 5 | Device activity log (`connect` / `worklist_pull` / `study_send`) | New |
| 6 | Equipment pending installation queue | New |
| 7 | Dashboard booking trend replaces recent activity; new filters | Breaking |
| 8 | New filters on bookings, contracts, requests, admin equipment | Added |
| 9 | Discovered equipment no longer parked under an "UNCAT" vendor | Changed |
| 10 | `linked` vs `is_connected` semantics | Clarified |

---

## 1. New — Facility Portal equipment (facility users)

Route group `/api/v1/facility/*`, allowed roles `f_admin`, `f_finance`,
`f_practitioner`, `f_equipment_user`, `f_view_only`. The facility is resolved
from the signed-in user's profile and is **never** sent by the client.

| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/facility/equipments` | Owned units **plus** vendor units mapped to the facility |
| GET | `/facility/equipments/{id}` | Detail page |
| POST | `/facility/equipments` | **`f_admin` only** — add a facility-owned unit |

**List filters:** `search`, `modality` (incl. `non_imaging`), `category`,
`status`, `is_connected`, `ownership_type` (`facility` \| `vendor`), `linked`,
`sort_by` (`name,code,category,status,created_at,last_seen_at`), `sort_order`,
`per_page`.

`meta.available_filters` carries the option lists (status, category, modality,
ownership_type, linked, sort_by, sort_order) and `meta.summary` carries
per-status counts plus `total`.

**Row shape** — `id, ownership_type, code, name, serial_number, model, brand,
category, category_label, modality, status, status_label, status_color,
is_operational, ae_title, is_connected, linked, last_seen_at,
vendor{id,code,name}, mapped_services_count, mapped_services[]`.

**Detail adds** — `description, specifications, is_currently_down,
active_downtime{id,started_at,reason,notes}, total_downtime_minutes,
dicom{ae_title, calling_ae_title, host, dicom_port, hl7_port, is_connected,
linked, last_seen_at, connected_at}, facility, manufacture_date,
status_history[], created_at, updated_at`.

`mapped_services[]` = `{contract_service_id, contract_id, lot_service_id, code,
name, tariff, is_active, lot{id,number,name}}` — this is what powers "which
equipment has been mapped to my facility, and what does it offer".

**POST body:** `contract_service_id` (required — must be an active service on
one of the facility's active contracts), `ae_title` (required), `name`,
`serial_number`. Everything else is copied from the source unit and the lot's
services are mapped automatically. Returns `201` with the full detail payload.

Errors: `403` when the user has no facility profile (`"Your account is not
linked to a facility."`), `404` when the service is not on an active contract,
`422` when the source unit has no equipment.

## 2. New — `f_view_only` role

New role value `f_view_only`, label **"View Only"**, category `facility`. Login
succeeds for it and `/auth/me/permissions` returns `view_bookings` and
`view_reports`.

**Frontend action:** render read-only — hide every create/edit control.

## 3. New — `GET /users/roles`

Role options for the user form's role picker, so the frontend does not have to
hardcode them. `scope` is `facility` for an HRIO (four roles) or `system` for a
system admin (all roles).

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

## 4. Changed — facility admins can manage their own facility's users

- `GET /users`, `POST /users` and `GET /users/{id}` now accept `f_admin`
  (previously `403`). Results are force-scoped to the caller's facility; a
  cross-facility `show` returns `404`.
- A facility admin may create only `f_finance`, `f_practitioner`,
  `f_equipment_user`, `f_view_only` — never another `f_admin`.
- For a facility admin, `facility_id` and `vendor_id` in the POST body are
  **`prohibited`**: sending either returns `422` with *"The facility is
  determined from your account and must not be supplied."* **Stop sending
  them.**
- `PUT` and `DELETE /users/{id}` remain system-admin only.

## 5. New — device activity log

An arrival log of everything that has reached out to VEMS, recorded with the
bare name the device sent.

| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/equipment/ping-requests/activity` | The log |
| GET | `/dicom/events/ping-events` | Alias of the same endpoint |
| GET | `/equipment/ping-requests/pending-installation` | Installation queue (see §6) |

**Filters:** `activity_type` (`connect` \| `worklist_pull` \| `study_send`),
`source_name`, `equipment_id`, `linked`, `period`, `from`, `to`, `page_size`
(max 100).

**Row:** `id, activity_type, source_name, device_name, ip_addr, port, modality,
equipment{id,code,name}|null, facility{id,name,fr_code}|null, context,
occurred_at`. Rows can legitimately be unlinked — `source_name` is whatever the
device announced, which may match no equipment record.

`meta.available_filters` carries the activity types and the shared `period`
presets.

## 6. New — equipment pending installation

`GET /equipment/ping-requests/pending-installation` (filters:
`unassigned_only`, `page_size`).

**Row:** `id, code, name, ae_title, status, status_label, vendor|null,
facility|null, discovered{ip,port}, hl7_host, dicom_port, last_seen_at,
created_at`.

Requires the `EquipmentStatus::PENDING_INSTALLATION` state added in §9.

## 7. Breaking — admin dashboard

`GET /api/v1/admin/dashboard`:

- ❌ The recent-bookings / recent-patient-activity block has been **removed**.
- ✅ Replaced by `booking_trend`, switchable with `?trend=daily|monthly`
  (daily = last 30 days, monthly = last 12 months):

```json
"booking_trend": {
  "granularity": "daily",
  "buckets": 30,
  "total": 128,
  "points": [ { "bucket": "2026-08-26", "label": "26 Aug", "count": 4 } ]
}
```

Periods without bookings are returned as `count: 0`, so the chart needs no
gap-filling.

- New `filters.available` block (cached 5 minutes) — `county`, `facility`,
  `facility_type`, `vendor`, `period`, `trend`. Drive the filter dropdowns from
  this instead of issuing separate lookups.
- New query param `facility_id`, alongside the existing `county_id`,
  `facility_type`, `vendor_id`, `lot_id` and `period`.

## 8. Added — filters on existing endpoints

| Endpoint | New params |
| -------- | ---------- |
| `GET /bookings` | `vendor_id` |
| `GET /contracts` | `lot_id` |
| `GET /requests` | `vendor_id`, `period`, `from`, `to` |
| `GET /admin/equipment` | `facility_id`, `linked` |

The shared `period` presets are `7d`, `30d`, `90d`, `12m`, `this_month`,
`this_year`.

## 9. Changed — discovered equipment

Devices that appear on the network are no longer parked under a placeholder
"UNCAT" vendor. They are created with `vendor_id = null`, `facility_id = null`
and `status = pending_installation`; surface them through
`/equipment/ping-requests/pending-installation`.

`POST /dicom/equipment/{equipment}/configure` now also accepts `facility_id`.

## 10. Field semantics

- **`linked` is not `is_connected`.** `linked` = the device has *ever* been seen
  on the network (`last_seen_at` is set); `is_connected` = it is connected
  *right now*. Use `linked` for availability filters, `is_connected` for the
  live badge.
- `linked` is **tri-state**: omit for both, `?linked=true` for only ever-seen,
  `?linked=false` for only never-seen. Send the literal strings `true` / `false`
  (the API also accepts `1` / `0`).
- `linked` is now present on admin equipment rows and facility equipment rows.
- `dicom_port: 11112` is the **placeholder default**, not a verified listening
  port. Do not present it as confirmed. A wrong port can only be corrected with
  `POST /dicom/equipment/{equipment}/configure`.
- `hl7_host` is the **device's** address, learned from the device's own traffic.
  Newly provisioned units legitimately have `hl7_host: null` until the device
  first checks in — render "awaiting first contact", not an error.

---

## Backend-only — no frontend work yet

- Study metadata is captured on `POST /dicom/callback/result` (study/series
  UIDs, study date and time, series and instance counts, institution, body part,
  and a whitelisted set of pixel descriptors — **no files**). It is stored but
  exposed by no endpoint yet.
- Equipment addresses self-heal on every heartbeat, MPPS, C-STORE and result
  callback.
- `php artisan vems:audit-modality-addresses` reports devices that cannot be
  C-ECHO'd and runs daily at 03:00 via the scheduler.
