"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineChartBarSquare,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineUsers,
  HiXMark,
} from "react-icons/hi2";

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onClose?: () => void;
}

function Sidebar({ isMobileMenuOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: <HiOutlineHome /> },
    { href: "/patients", label: "Patients", icon: <HiOutlineUser /> },
    { href: "/equipments", label: "Equipments", icon: <HiOutlineUsers /> },
    { href: "/facilities", label: "Facilities", icon: <HiOutlineUsers /> },
    { href: "/vendors", label: "Vendors", icon: <HiOutlineUsers /> },
    { href: "/contracts", label: "Contracts", icon: <HiOutlineUsers /> },
    { href: "/lots", label: "Lots", icon: <HiOutlineUsers /> },
    { href: "/bookings", label: "Services", icon: <HiOutlineUsers /> },
    {
      href: "/bookings/synced",
      label: "Synched to SHA",
      icon: <HiOutlineChartBarSquare />,
    },
    { href: "/trends", label: "Analytics", icon: <HiOutlineChartBarSquare /> },
    // {
    //   href: "/payments",
    //   label: "Payments Report",
    //   icon: <HiOutlineUsers />,
    // },
    // {
    //   label: "Reports",
    //   icon: <HiOutlineUsers />,
    //   children: [
    //     { href: "/reports/facility", label: "Facility Report" },
    //     { href: "/reports/vendor", label: "Vendor Report" },
    //     { href: "/reports/payments", label: "Payments Report" },
    //   ],
    // },
    // { href: "/services", label: "Services", icon: <HiOutlineHomeModern /> },
    // { href: "/lems", label: "Lems", icon: <HiOutlineCog6Tooth /> },
  ];

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`
      bg-white border-r shadow-lg border-gray-200 h-full overflow-y-auto
      ${
        isMobileMenuOpen
          ? "fixed inset-y-0 left-0 z-50 w-64 md:relative md:w-auto transform translate-x-0"
          : "hidden md:block transform -translate-x-full md:translate-x-0"
      }
      transition-transform duration-300 ease-in-out
    `}
    >
      <div className="bg-white rounded-lg shadow p-4 h-full">
        {/* Mobile close button */}
        {isMobileMenuOpen && (
          <div className="flex justify-end mb-4 md:hidden">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <HiXMark className="w-6 h-6" />
            </button>
          </div>
        )}

        <nav>
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 text-gray-600 text-base font-medium px-4 md:px-6 py-3 rounded transition-all ${
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
                  <span className="text-sm md:text-base">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
