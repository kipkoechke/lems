"use client";
import Header from "./Header";
import Sidebar from "./Sidebar";

import { ReactNode, useState } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      <Header
        onMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
      <main className="overflow-auto bg-gray-100 md:col-start-2">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-4 md:gap-8 p-4 md:p-0">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </div>
  );
};

export default AppLayout;
