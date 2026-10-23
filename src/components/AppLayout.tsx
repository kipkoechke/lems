"use client";
import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";
import SectionTabs from "./layout/SectionTabs";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { FaLock } from "react-icons/fa";
import { useCurrentUser, useSyncPermissions } from "@/hooks/useAuth";
import { useRouteBlocked } from "@/lib/navigation";

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useCurrentUser();
  const blocked = useRouteBlocked(usePathname());

  // Re-read the caller's grants once per session so permission changes made by
  // an admin take effect without a re-login.
  useSyncPermissions();

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
      <main className={`overflow-auto ${showSidebar ? "md:col-start-2" : ""}`}>
        {/* A grouped page's tabs. The padding puts them on the same edge as
            the page's own content: this wrapper's p-4 plus the page's p-3 on
            a phone, the page's p-6 on a desktop. */}
        <SectionTabs className="mx-auto max-w-screen-xl px-7 pt-4 md:px-6 md:pt-6" />
        <div className="mx-auto flex max-w-screen-xl flex-col gap-4 md:gap-8 p-4 md:p-0">
          {blocked ? <NotAvailable /> : children}
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

/**
 * In place of a page this account cannot use, opened from a link or a typed
 * URL. Rendering the page instead would fire calls the account is refused.
 */
function NotAvailable() {
  return (
    <div className="p-3 md:p-6">
      <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white px-6 py-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <FaLock className="h-5 w-5 text-slate-500" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900">
          This page isn&apos;t part of your account
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Everything you can use is in the menu.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go to the dashboard
        </Link>
      </div>
    </div>
  );
}

export default AppLayout;
