"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useAuth";
import { RoleBasedDashboard } from "@/components/RoleBasedDashboard";

export default function HomePage() {
  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    if (user && user.role === "f_medical") {
      // Clinicians go directly to clinician services page
      router.replace("/clinician");
    }
  }, [user, router]);

  // If f_medical, show loading while redirecting
  if (user?.role === "f_medical") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For other roles, show the original dashboard
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <RoleBasedDashboard />
    </div>
  );
}
