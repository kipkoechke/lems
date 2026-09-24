# API Changelog — 2026-09-24

Frontend-facing changes in this development cycle (commits `4e90369` → `3e02a1d`).

Everything is under `/api/v1` and requires a Sanctum bearer token unless stated
otherwise. Full request/response detail lives in `docs/api-reference.md`.

**Deploy prerequisites:** three migrations must run —
`add_study_metadata_to_equipment_work_lists_table`,
`create_device_activity_logs_table`, and
`make_booked_service_nullable_and_add_is_test_to_equipment_work_lists_table`.

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
| 11 | Test worklists now capture their study result | Fixed |
| 12 | MPPS / C-STORE rejected every accession-number lookup | Fixed |
| 13 | Worklists may have no booked service; `is_test` flag added | Changed |
| 14 | `worklist_tests` component on every equipment detail | New |
| 15 | Live / linked / never-connected card on all three dashboards | New |
| 16 | Admin dashboard reported 0 linked equipment | Fixed |
| 17 | A facility's second unit of the same modality could not be created | Fixed |
| 18 | Study capture was dropping half the payload | Fixed |
| 19 | Non-SHA studies captured instead of rejected | New |
| 20 | Test MWL carries a realistic demo patient | Fixed |
| 21 | Result callback now sends the reporting AE title | Fixed |
| 22 | Pixel descriptors resolved from Orthanc | New |
| 23 | Studies with no accession number are no longer discarded | Fixed |

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

## 11. Fixed — a test worklist now captures its study result

`POST /vendor/worklist-test` used to create the probe worklist **only on
Orthanc**. When the modality acquired the study and sent it back, the result
callback matched the accession against nothing and answered
`404 Worklist not found for accession number` — the loop never closed.

The endpoint now also registers the probe in VEMS with `is_test: true`, so the
returning study attaches exactly as a real one does. The response gains
`data.worklist_id`, and an accession that already belongs to another worklist is
refused with `422` rather than being hijacked.

## 12. Fixed — MPPS / C-STORE rejected every accession-number lookup

`POST /dicom/events/mpps` and `POST /dicom/events/c-store` resolve their
worklist from `internal_request_id`, which may be the worklist UUID **or** the
accession number. The lookup compared both values against the uuid `id` column,
so passing an accession such as `ACC202609240001` produced
`SQLSTATE[22P02] invalid input syntax for type uuid` — a hard failure, not a
miss. The id is now only compared when the value is actually a UUID.

## 13. Changed — worklists without a booked service

`equipment_work_lists.booked_service_id` is now nullable and a new `is_test`
boolean defaults to `false`.

- Test worklists are excluded from `counts.active_worklists` on the dashboard.
- `is_test` worklists are not pushed to Orthanc by the model; the endpoint that
  creates them pushes its own probe tags.
- The presentation layer already tolerated a missing booked service — `booking`
  and `service` simply come back as `null` on the HMIS worklist copy.

## 14. New — equipment testing history on every equipment detail

Each equipment detail response now carries a `worklist_tests` component: every
probe run against that machine, **newest first**, so one table renders in the
vendor, facility and admin portals without a second request.

| Endpoint |
| -------- |
| `GET /vendor/equipments/{equipment}` |
| `GET /facility/equipments/{equipment}` |
| `GET /vendors/{vendor}/equipments/{equipment}` |
| `GET /admin/equipment/{equipment}` |

```json
"worklist_tests": {
  "total": 3,
  "succeeded": 2,
  "awaiting_result": 1,
  "last_tested_at": "2026-09-24T08:30:00+03:00",
  "results": [
    {
      "id": "uuid",
      "accession_number": "MWL_TEST_20260924083000_XRD01",
      "worklist_status": "completed",
      "result_status": "final",
      "succeeded": true,
      "awaiting_result": false,
      "result_received_at": "2026-09-24T08:31:12+03:00",
      "study_instance_uid": "1.2.826.0.1.3680043.8.498.10",
      "study_date": "2026-09-24",
      "performed_by_ae_title": "XRD01",
      "performed_by": null,
      "created_at": "2026-09-24T08:30:00+03:00",
      "sent_at": "2026-09-24T08:30:01+03:00",
      "completed_at": "2026-09-24T08:31:12+03:00"
    }
  ]
}
```

- **`succeeded`** — badge this one. It is `true` exactly when the study came
  back, which is the only proof the whole C-FIND → acquisition → C-STORE →
  callback chain worked.
- **`awaiting_result`** — the probe is out and nothing has come back yet.
- `results` holds the newest 20; the three counters cover **all** tests.
- Equipment that has never been tested returns `results: []` with zero counters.

---

## 15. New — connectivity card on admin, facility and vendor dashboards

All three dashboards now report the same three numbers, from one shared helper:

```json
"equipment_connectivity": { "live": 9, "linked": 27, "never_connected": 15, "total": 42 }
```

| Dashboard | Location |
| --------- | -------- |
| `GET /admin/dashboard` | `counts.equipment_connectivity` |
| `GET /vendor/dashboard` | `data.equipment.by_connectivity` |
| `GET /facility/dashboard` | `data.equipment.by_connectivity` |

| Field | Meaning |
| ----- | ------- |
| `live` | Connected right now (`is_connected`) |
| `linked` | Has reported at least once (`last_seen_at` set) — same meaning as `?linked=true` on the equipment listings |
| `never_connected` | Never heard from — the un-pingable units |
| `total` | `linked + never_connected` |

**`live` is a subset of `linked`.** The three are deliberately not mutually
exclusive, so `linked` keeps the meaning it already has on the equipment
listings. `linked + never_connected` is always the total.

## 16. New — `GET /facility/dashboard`

Facilities had no dashboard endpoint at all. It now exists, scoped to the same
equipment population as the facility equipment listings (owned units + vendor
units mapped by an active contract service), with six cards:

```json
{
  "equipment": {
    "total": 24,
    "by_status": { "active": 20, "maintenance": 2, "down": 1, "pending_installation": 1 },
    "by_connectivity": { "live": 3, "linked": 12, "never_connected": 12, "total": 24 }
  },
  "studies": {
    "total": 180, "active": 4, "completed": 172, "cancelled": 4,
    "with_result": 169, "awaiting_result": 3, "average_turnaround_minutes": 12.4
  },
  "services": {
    "total": 190, "completed": 175, "not_started": 10, "cancelled": 5,
    "completion_rate": 94.6
  },
  "revenue": { "tariff": "285000.00", "facility_share": "57000.00", "vendor_share": "228000.00" },
  "bookings": {
    "total": 96, "this_month": 14,
    "by_status": { "pending_otp": 2, "active": 4, "completed": 86, "cancelled": 4 },
    "patients": 61
  }
}
```

- **`studies.average_turnaround_minutes`** — minutes from the worklist being
  published to the result arriving; `null` until the first round trip completes.
- **`services.completion_rate`** — completed ÷ (total − cancelled), so cancelled
  services don't drag the rate down.
- **`studies`** excludes `is_test` worklists, so a vendor running a probe never
  moves an operational figure.
- Six cards, five aggregate queries.

Visible to every facility role (`f_admin`, `f_finance`, `f_practitioner`,
`f_equipment_user`, `f_view_only`); `403` when the account has no facility.
`by_status` always carries every status so the card keeps its shape.

## 17. Fixed — admin dashboard reported 0 linked equipment

`counts.equipment_by_linkage.linked` was **always 0**, and the entire estate was
reported as not linked. The aggregate column was aliased `linked`, which the
`Equipment` model's `linked` accessor shadows on the hydrated row — the accessor
reads `last_seen_at`, which the aggregate does not select, so it answered
`false` every time. Aliases are now `linked_count` / `not_linked_count`.

## 18. Fixed — a facility could not hold two units of the same modality

`Equipment::generateCode()` returned a fixed `{fr_code} {modality}` for
facility-owned equipment, so creating a second unit of the same modality in the
same facility violated `equipment_code_unique`. It now suffixes `-2`, `-3`, …
when the base code is taken, counting soft-deleted rows too since they still
hold their code. Vendor-owned codes already sequenced.

## 18. Fixed — study capture was discarding half the payload

The DICOM callback has always sent more than we kept. Now stored on the worklist:

| Field | Was | Now |
| ----- | --- | --- |
| `manufacturer` | dropped | stored |
| `station_name` | dropped | stored |
| `performed_at` | dropped | stored, from `PerformedProcedureStepStartDate`/`Time` — the acquisition time, not `StudyDate` |
| `series_count`, `instance_count` | `0` from the Lua, never filled | resolved from Orthanc when absent or `0` |

A DICOM instance carries no series or instance count of its own, so the counts
are read back from the Orthanc study. An unreachable Orthanc leaves them unset
rather than recording a misleading zero.

The round-trip test now drives the callback with the **real Lua payload** and
asserts every stored field — UIDs, description, modality, body part, study and
performed timing, institution, manufacturer, station, technologist, referring
physician, pixel descriptors, and the performing machine.

> Still not captured: **pixel descriptors never arrive** — the Lua callback does
> not send `pixel_metadata`. The endpoint accepts it, so a richer plugin can
> supply it, but today `pixel_metadata` is null on every real study.

## 19. New — non-SHA studies

A study that reaches Orthanc with no VEMS order behind it — a walk-in, a private
patient, a machine used outside the SHA workflow — used to be **rejected with
`404`** and lost. It is now recorded and attributed to the machine that reported
it: equipment → vendor → facility.

- `POST /dicom/callback/result` with an unknown accession returns `200` and the
  new `unmatched_study_id`, instead of `404`.
- Everything the callback carried is kept, including the raw payload.
- A study whose AE title matches no equipment is kept too, and stays visible to
  admins only (`unattributed`).
- No pixel data is retained — the study is stripped in Orthanc exactly as an
  ordered one is.
- Re-notification of the same study UID updates the row rather than duplicating it.

| Endpoint | Sees |
| -------- | ---- |
| `GET /admin/studies/unmatched` | Every non-SHA study, including unattributed ones |
| `GET /vendor/studies/unmatched` | Studies on this vendor's machines |
| `GET /facility/studies/unmatched` | Studies on machines the facility owns or that vendors mapped to it |

Newest first, filterable by `modality`, `equipment_id`, `vendor_id`,
`facility_id`, `search`, `attributed`, `period` / `from` / `to`, `page_size`.
Each response carries a `summary` block: `total`, `this_month`, `unattributed`,
`latest_received_at`.

Each dashboard also gained the same counter:

| Dashboard | Location |
| --------- | -------- |
| `GET /admin/dashboard` | `counts.unmatched_studies` |
| `GET /vendor/dashboard` | `data.unmatched_studies` |
| `GET /facility/dashboard` | `data.unmatched_studies` |

## 20. Fixed — the test MWL carried placeholder patient details

`POST /vendor/worklist-test` sent `VEMS_TEST_PATIENT` / `Test^Patient` / sex `O`
/ `PatientBirthDate: 19900101`, and the accession was a synthetic
`MWL_TEST_20260924083000_XRD01`. A vendor testing a machine saw nothing like what
a real order looks like.

The probe now carries a **demo patient** — realistic enough that the modality
renders something representative, and unmistakably synthetic:

| Tag | Value |
| --- | ----- |
| `PatientID` | A fresh `VT` number, e.g. `VT762` — no hyphens, never a real identifier |
| `PatientName` | A demo name, as `GIVEN^FAMILY` |
| `PatientSex` | Randomly `M` or `F` |
| `PatientBirthDate` | A random date of birth, `Ymd` |
| `AccessionNumber` | A real accession, e.g. `ACC202609240007` |
| `InstitutionName` | The facility the machine belongs to |

Every probe generates a **new** demo patient, so consecutive tests are
distinguishable. The tags are built by the same code as an ordered worklist, so
the probe cannot drift from reality.

Pass `patient_id` (a real patient UUID) to put a real record on the probe
instead. There is deliberately **no real-patient fallback** — a stranger's
record must not appear on a modality because somebody pressed a button.
`patient_name` is no longer accepted. The response gained `dicom_patient` (the
exact tags sent) and `patient` (the record, when one was supplied).

## 21. Fixed — the result callback never sent the reporting AE title

`on-stable-study.lua` sent `station_name` but **not** `station_ae_title`, so
`POST /dicom/callback/result` always received an empty station. Two consequences,
both silent:

- **Non-SHA studies could never be attributed.** Every `unmatched_study` would
  have been filed as `unattributed`, with no vendor and no facility, visible to
  admins only — defeating the point of the feature.
- **Ordered studies never credited a performer.** `performed_by_equipment_id`
  and `performed_by_ae_title` stayed null on every real study.

The Lua now sends `station_ae_title` (from `RemoteAet`) and `remote_ip` with the
result callback. `station_name` is a DICOM display name and cannot be used for
matching; the AE title is the machine's registered identity.

> Requires redeploying `orthanc/on-stable-study.lua` and restarting Orthanc.
> Until then, studies keep arriving unattributed — existing rows can be filled in
> by a backfill once the AE title starts arriving.

## 22. New — image descriptors are read back from Orthanc

`pixel_metadata` was accepted by the endpoint but **never sent by the Lua**, so
it was null on every study. Rather than teach the Lua to read DICOM tags, VEMS
now asks Orthanc for the study's first instance
(`/instances/{id}/tags?simplify`) and filters the values through the same
whitelist the callback uses. Tag *values* only — no pixel data can be pulled in.

- No Orthanc redeploy needed, and it works for studies already captured.
- Descriptors supplied by a callback still win over the ones read back.
- A study with no image instances (SR, KOS) has no descriptors.
- Costs two extra REST calls per study — the study lookup it already made, plus
  one instance — as part of the existing series walk.

## 23. Fixed — studies with no accession number were deleted on arrival

`on-stable-study.lua` deleted any instance whose study had no `AccessionNumber`
("cannot be tracked; delete to avoid orphaned data"). That was true when there
was nowhere to file such a study — there is now.

The Lua identifies the study by `StudyInstanceUID` when there is no accession,
sends it, and **keeps** the instance, exactly as it does for an ordered study:
VEMS strips the pixel data, leaving a metadata-only record in the study list.
Only an instance with neither identifier is deleted.

On the VEMS side a callback with no `accession_number` is filed as an
unmatched study keyed on the study UID (so re-notification updates rather than
duplicates), and one with neither identifier is refused with `422`.

> Also requires the redeploy above.

> **Storage note:** every study now leaves a metadata-only record in Orthanc.
> Pixel data is stripped, so each is small, but this is unbounded growth rather
> than the previous delete-on-arrival. Worth pointing Orthanc's own housekeeping
> at old studies if the volume warrants it.

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
