import ContractManagement from "@/features/vendors/ContractManagement";

interface VendorContractsPageProps {
  params: {
    vendorCode: string;
  };
}

export default function VendorContractsPage({
  params,
}: VendorContractsPageProps) {
  return <ContractManagement vendorCode={params.vendorCode} />;
}
