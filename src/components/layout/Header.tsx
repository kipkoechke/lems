"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { FaUser, FaBell } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import {
  useLogout,
  useCurrentUser,
  useCurrentFacility,
} from "../../hooks/useAuth";

interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const Header = ({ onMenuToggle, isMobileMenuOpen }: HeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = useCurrentUser();
  const facility = useCurrentFacility();
  const logoutMutation = useLogout();
  const menuRef = useRef<HTMLDivElement>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 col-span-full">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <HiXMark className="w-6 h-6" />
          ) : (
            <HiBars3 className="w-6 h-6" />
          )}
        </button>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Ministry of Health Logo */}
          <div className="h-10 md:h-12 w-auto">
            <Image
              src="/assets/moh-logo.png"
              alt="Ministry of Health Logo"
              width={535}
              height={100}
              className="h-full w-auto object-contain"
              priority
              quality={100}
            />
          </div>

          {/* Vertical Separator Line */}
          <div className="h-4 md:h-6 w-px bg-gray-300"></div>

          {/* COG Logo */}
          <div className="h-10 md:h-12 w-auto">
            <Image
              src="/assets/cog-logo.png"
              alt="COG Logo"
              width={535}
              height={100}
              className="h-full w-auto object-contain"
              priority
              quality={100}
            />
          </div>
        </div>

        {/* Date & Time Badge */}
        <div className="hidden md:flex bg-green-700 text-white px-4 py-1.5 rounded text-sm items-center gap-2">
          <span className="font-medium">{formatDate(currentTime)}</span>
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Center - Facility Name */}
      <div className="flex-1 max-w-md mx-4">
        <h1 className="text-base md:text-lg font-semibold text-gray-900 text-center">
          {facility?.name || "Demo Facility Name"}
        </h1>
      </div>

      {/* Right side - Icons */}
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </button>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded relative">
          <FaBell className="w-5 h-5" />
        </button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full bg-gray-200"
          >
            <FaUser className="w-5 h-5 text-gray-600" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && user && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">User Profile</h3>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                >
                  <MdClose className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* User Details */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <FaUser className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Role:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.role || "N/A"}
                    </span>
                  </div>
                  {facility && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Facility:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {facility.name || "N/A"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">User ID:</span>
                    <span className="text-sm font-mono text-gray-900">
                      {user.id}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
