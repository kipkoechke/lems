import AppLayout from "@/components/AppLayout";
import Providers from "@/lib/providers";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lems",
  description: "Leased Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <AppLayout>{children}</AppLayout>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
