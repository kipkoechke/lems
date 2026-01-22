"use client";
import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";

import { ReactNode, useState } from "react";
import { useCurrentUser } from "@/hooks/useAuth";

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useCurrentUser();

  // Trust the middleware to handle authentication
  // If this component renders, the user should be authenticated (middleware allows it)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Hide sidebar for f_practitioner users
  const showSidebar = user?.role !== "f_practitioner";

  return (
    <div
      className={`h-screen grid grid-cols-1 ${
        showSidebar ? "md:grid-cols-[auto_1fr]" : ""
      } grid-rows-[auto_1fr]`}
    >
      <Header
        onMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      {/* Sidebar - hidden for f_practitioner users */}
      {showSidebar && (
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
        />
      )}
      <main
        className={`overflow-auto bg-gray-100 ${
          showSidebar ? "md:col-start-2" : ""
        }`}
      >
        <div className="mx-auto flex max-w-screen-xl flex-col gap-4 md:gap-8 p-4 md:p-0">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobileMenuOpen && showSidebar && (
        <div
          className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </div>
  );
};

export default AppLayout;
