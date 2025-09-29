import AppLayout from "@/components/AppLayout";
import { ReactNode } from "react";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
