"use client";

import DashboardView from "@/features/trends/BookingTrends";
import VendorDashboard from "@/components/VendorDashboard";
import FacilityDashboard from "@/features/facilities/FacilityDashboard";
import { isFacilityRole } from "@/lib/rbac";
import { DashboardSkeleton } from "@/components/common/Skeleton";
import { useCurrentUserWithLoading } from "@/hooks/useAuth";

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
