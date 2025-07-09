"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineChartBarSquare,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineUsers,
} from "react-icons/hi2";

function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: <HiOutlineHome /> },
    { href: "/patients", label: "Patients", icon: <HiOutlineUser /> },
    // { href: "/equipments", label: "Equipments", icon: <HiOutlineUsers /> },
    { href: "/facilities", label: "Facilities", icon: <HiOutlineUsers /> },
    { href: "/vendors", label: "Vendors", icon: <HiOutlineUsers /> },
    { href: "/contracts", label: "Contracts", icon: <HiOutlineUsers /> },
    { href: "/lots", label: "Lots", icon: <HiOutlineUsers /> },
    { href: "/bookings", label: "Services", icon: <HiOutlineUsers /> },
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

  return (
    <div className="bg-white border-r shadow-lg border-gray-200 h-full overflow-y-auto">
      <div className="bg-white rounded-lg shadow p-4 h-full">
        <nav>
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
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
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
