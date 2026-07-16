"use client";

import DashboardView from "@/features/trends/BookingTrends";
import VendorDashboard from "@/components/VendorDashboard";
import { useCurrentUserWithLoading } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, isLoading } = useCurrentUserWithLoading();

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vendors cannot call /admin/dashboard (403) — they get the vendor-scoped
  // dashboard instead.
  if (user?.role === "vendor") {
    return <VendorDashboard />;
  }

  return <DashboardView />;
}
