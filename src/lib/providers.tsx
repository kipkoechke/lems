"use client";

import { WorkflowProvider } from "@/context/WorkflowContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <WorkflowProvider>{children}</WorkflowProvider>
    </QueryClientProvider>
  );
}
