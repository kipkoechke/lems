"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineUsers,
} from "react-icons/hi2";

function Sidebar() {
  const pathname = usePathname();
  const [reportsOpen, setReportsOpen] = useState(
    pathname.startsWith("/reports")
  );

  const navItems = [
    { href: "/", label: "Home", icon: <HiOutlineHome /> },
    { href: "/patients", label: "Patients", icon: <HiOutlineUser /> },
    { href: "/equipments", label: "Equipments", icon: <HiOutlineUsers /> },
    { href: "/facilities", label: "Facilities", icon: <HiOutlineUsers /> },
    { href: "/bookings", label: "Services", icon: <HiOutlineUsers /> },
    {
      href: "/payments",
      label: "Payments Report",
      icon: <HiOutlineUsers />,
    },
    {
      label: "Reports",
      icon: <HiOutlineUsers />,
      children: [
        { href: "/reports/facility", label: "Facility Report" },
        { href: "/reports/vendor", label: "Vendor Report" },
        { href: "/reports/payments", label: "Payments Report" },
      ],
    },
    // { href: "/services", label: "Services", icon: <HiOutlineHomeModern /> },
    // { href: "/lems", label: "Lems", icon: <HiOutlineCog6Tooth /> },
  ];

  return (
    <div className="bg-white border-r shadow-lg  border-gray-200 h-full overflow-y-auto">
      <div className="bg-white rounded-lg shadow p-4 h-full">
        <nav>
          <ul className="flex flex-col gap-2">
            {navItems.map((item) =>
              !item.children ? (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 text-gray-600 text-base font-medium px-6 py-3 rounded transition-all ${
                      pathname === item.href
                        ? "bg-gray-200 text-gray-800"
                        : "hover:bg-gray-300 hover:text-gray-800"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 ${
                        pathname === item.href
                          ? "text-brand-600"
                          : "text-gray-400"
                      } transition-all`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ) : (
                <li key={item.label}>
                  <button
                    type="button"
                    className="flex items-center gap-3 text-gray-600 text-base font-medium px-6 py-3 rounded w-full transition-all hover:bg-gray-50 hover:text-gray-800"
                    onClick={() => setReportsOpen((open) => !open)}
                  >
                    <span className="w-6 h-6 text-gray-400">{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="ml-auto">
                      {reportsOpen ? (
                        <HiOutlineChevronDown />
                      ) : (
                        <HiOutlineChevronRight />
                      )}
                    </span>
                  </button>
                  {reportsOpen && (
                    <ul className="ml-8 flex flex-col gap-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`flex items-center gap-2 text-gray-600 text-base font-medium px-4 py-2 rounded transition-all ${
                              pathname === child.href
                                ? "bg-gray-100 text-gray-800"
                                : "hover:bg-gray-50 hover:text-gray-800"
                            }`}
                          >
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
