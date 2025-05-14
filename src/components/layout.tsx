// components/Layout.tsx
"use client";

import { usePathname } from "next/navigation"; // ✅ FIXED
import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname(); // ✅ instead of useRouter

  const isActiveRoute = (route: string) => {
    return pathname === route ? "bg-blue-700" : "";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>

      <footer className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-600">
            &copy; {new Date().getFullYear()} Leased Equipment Management
            System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
