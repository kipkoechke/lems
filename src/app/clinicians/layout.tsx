// app/register/layout.tsx
import Layout from "@/components/layout";
import React from "react";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
