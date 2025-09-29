"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface VendorContractsPageProps {
  params: Promise<{
    vendorCode: string;
  }>;
}

export default function VendorContractsPage({
  params,
}: VendorContractsPageProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to contracts page with vendor filter
    const getParams = async () => {
      const { vendorCode } = await params;
      router.replace(`/contracts?vendor=${vendorCode}`);
    };
    getParams();
  }, [params, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to contracts...</p>
      </div>
    </div>
  );
}
