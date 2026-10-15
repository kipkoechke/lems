// TEMPORARY harness route: serves booking fixtures from the app's own origin so
// the real pages can be rendered without the live API. Not part of the feature.
import { NextResponse } from "next/server";

const list = {
  data: [
    {
      id: "b1", booking_number: "VB202610050104", visit_id: "v1",
      claim_id: "f4e7e380-4166-437e-aa9e-3b550bb593a4",
      patient: { id: "p1", name: "PHARES O**A O*****O", phone: "+254712345672", identification_no: "31234564", sha_number: "SHA7093457020225-9", date_of_birth: "1996-05-20", gender: "Male" },
      facility: { id: "f1", name: "JARAMOGI OGINGA ODINGA TEACHING AND REFERRAL HOSPITAL", fr_code: "FID-42-102973-7" },
      source: "provider_portal", status: "completed", override: false, finance_approved: true,
      finance_approved_at: "2026-10-05T15:49:47+00:00",
      payment: { tariff: "6900.00", sha: "6900.00", cash: "0.00", other_insurance: "0.00" },
      sha_submitted: true, sha_verified: true,
      services: [], created_at: "2026-10-05T15:20:58+00:00", updated_at: "2026-10-06T08:04:40+00:00"
    },
    {
      id: "b2", booking_number: "VB202610110018",
      claim_id: "aa11bb22-0000-1111-2222-333344445555",
      patient: { id: "p2", name: "JANE W***E K****O", phone: "+254700111222", identification_no: "22334455", sha_number: null, date_of_birth: "1988-01-02", gender: "Female" },
      facility: { id: "f1", name: "BONDO SUB-COUNTY HOSPITAL", fr_code: "FID-34-115630-8" },
      source: "standalone", status: "active", finance_approved: false,
      payment: { tariff: "3500.00", sha: "3000.00", cash: "500.00", other_insurance: "0.00" },
      sha_submitted: true, sha_verified: false,
      services: [], created_at: "2026-10-11T08:00:00+00:00"
    },
    {
      id: "b3", booking_number: "VB202610120003",
      patient: { id: "p3", name: "PETER M****A N*****I", phone: "+254733444555", identification_no: "99887766", sha_number: null, date_of_birth: "1979-07-07", gender: "Male" },
      facility: { id: "f1", name: "BONDO SUB-COUNTY HOSPITAL", fr_code: "FID-34-115630-8" },
      source: "hmis", status: "pending_otp", finance_approved: false,
      payment: { tariff: "1200.00", sha: "0.00", cash: "1200.00", other_insurance: "0.00" },
      sha_submitted: false, sha_verified: false,
      services: [], created_at: "2026-10-12T09:30:00+00:00"
    }
  ],
  summary: {
    total_bookings: 3, unique_patients: 3,
    by_status: { pending_otp: 1, active: 1, completed: 1, cancelled: 0 },
    by_source: { standalone: 1, hmis: 1, provider_portal: 1 },
    revenue: { tariff: "11600.00", sha: "9900.00", cash: "1700.00", other_insurance: "0.00" }
  },
  pagination: { current_page: 1, last_page: 1, per_page: 15, total: 3, from: 1, to: 3 }
};

const detail = {
  data: {
    ...list.data[0],
    services: [
      {
        lot: { number: "4", name: "Diagnostics Imaging CT" },
        service: { id: "s1", code: "SHA-09-015", name: "CT. Scan Chest" },
        scheduled_date: "2026-10-05", tariff: "6900.00",
        payment: { cash: "0.00", other_insurance: "0.00", sha: "6900.00" },
        revenue: { vendor_share: "6210.00", facility_share: "690.00" },
        equipment: { id: "e1", code: "FID421029737CT", name: "Multi-Slice CT Scanner — JARAMOGI OGINGA ODINGA TEACHING AND REFERRAL HOSPITAL", status: "active", ae_title: "JOOTRH_CT", vendor: { id: "v1", name: "Sunview Medipro International Ltd" } },
        practitioner: null, status: "completed", cancel_reason: null, notes: null,
        equipment_assigned_at: null, started_at: null, completed_at: "2026-10-06T08:04:40+00:00",
        result: { accession_number: "ACC202610050107", modality: "CT", study_description: "CT. Scan Chest", result_status: "final", result_body: null, observations: [], performing_technologist: "K^I^N", interpreting_physician: null, has_critical_values: false, received_at: "2026-10-06T08:04:40+00:00", worklist_status: "completed" }
      }
    ],
    sha_verifications: {
      count: 1, last_queried_at: "2026-10-05T15:49:47+00:00",
      history: [{
        id: "hv1", queried_at: "2026-10-05T15:49:47+00:00", verified: true, source: "provider",
        reference_type: "claim_id", reference_number: "f4e7e380-4166-437e-aa9e-3b550bb593a4",
        asked_by: "Payer System", tariff: 6900, sha: 6900, vendor_share: 6210, facility_share: 690,
        services: [{ code: "SHA-09-015", name: "CT. Scan Chest", tariff: 6900, sha: 6900, vendor_share: 6210, facility_share: 690 }]
      }]
    },
    created_by: { id: "u1", name: "Provider Portal" }
  }
};

export function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return params.then(({ path }) => {
    const joined = (path ?? []).join("/");
    if (/^bookings\/[^/]+$/.test(joined)) return NextResponse.json(detail);
    if (joined === "bookings") return NextResponse.json(list);
    if (joined === "auth/me/permissions") return NextResponse.json({});
    if (joined === "vendors") return NextResponse.json({ data: [] });
    return NextResponse.json({
      data: [],
      pagination: { current_page: 1, last_page: 1, per_page: 20, total: 0, from: 0, to: 0 },
    });
  });
}
