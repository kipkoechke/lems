"use client";

import dynamic from "next/dynamic";
import { isFacilityRole } from "@/lib/rbac";
import { DashboardSkeleton } from "@/components/common/Skeleton";
import { useCurrentUserWithLoading } from "@/hooks/useAuth";

// Each dashboard is its own chunk. Imported statically they all shipped
// together — the admin view alone pulls in the charting library — so every
// role paid for all three before anything could render after login.
const DashboardView = dynamic(() => import("@/features/trends/BookingTrends"), {
  loading: () => <DashboardSkeleton stats={5} panels={3} />,
});

const VendorDashboard = dynamic(() => import("@/components/VendorDashboard"), {
  loading: () => <DashboardSkeleton stats={4} panels={3} />,
});

const FacilityDashboard = dynamic(
  () => import("@/features/facilities/FacilityDashboard"),
  { loading: () => <DashboardSkeleton stats={5} withTable /> },
);

export default function DashboardPage() {
  const { user, isLoading } = useCurrentUserWithLoading();

  if (isLoading) {
    return <DashboardSkeleton stats={5} withTable />;
  }

  // Vendors cannot call /admin/dashboard (403) — they get the vendor-scoped
  // dashboard instead.
  if (user?.role === "vendor") {
    return <VendorDashboard />;
  }

  // Facility accounts get 403 from /admin/dashboard too, despite the reference
  // listing it as their facility dashboard. Theirs is built from the booking
  // and worklist endpoints they can actually call.
  if (isFacilityRole(user?.role)) {
    return <FacilityDashboard />;
  }

  return <DashboardView />;
}
