import ContractManagement from "@/features/vendors/ContractManagement";

interface VendorContractsPageProps {
  params: Promise<{
    vendorCode: string;
  }>;
}

export default async function VendorContractsPage({
  params,
}: VendorContractsPageProps) {
  const { vendorCode } = await params;
  return <ContractManagement vendorCode={vendorCode} />;
}
