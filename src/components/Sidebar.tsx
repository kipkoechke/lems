"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineCalendarDays,
  HiOutlineCog6Tooth,
  HiOutlineHome,
  HiOutlineHomeModern,
  HiOutlineUsers,
} from "react-icons/hi2";

function MainNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: <HiOutlineHome /> },
    {
      href: "/clinicians",
      label: "Clinicians",
      icon: <HiOutlineCalendarDays />,
    },
    { href: "/services", label: "Services", icon: <HiOutlineHomeModern /> },
    { href: "/facilities", label: "Facilities", icon: <HiOutlineUsers /> },
    { href: "/lems", label: "Lems", icon: <HiOutlineCog6Tooth /> },
  ];

  return (
    <nav>
      <ul className="flex flex-col gap-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 text-gray-600 text-base font-medium px-6 py-3 rounded transition-all ${
                pathname === item.href
                  ? "bg-gray-100 text-gray-800"
                  : "hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span
                className={`w-6 h-6 ${
                  pathname === item.href ? "text-brand-600" : "text-gray-400"
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
  );
}

export default MainNav;
