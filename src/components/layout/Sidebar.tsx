"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineChartBarSquare,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineUsers,
  HiXMark,
  HiOutlineDocumentText,
  HiOutlineCog6Tooth,
  HiOutlineClipboardDocumentList,
  HiOutlineCurrencyDollar,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { useAccessibleNavItems } from "@/lib/navigation";

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onClose?: () => void;
}

// Icon mapping for navigation items
const getIconForRoute = (href: string) => {
  if (href === "/") return <HiOutlineHome />;
  if (href.startsWith("/patients")) return <HiOutlineUser />;
  if (href.startsWith("/equipments")) return <HiOutlineCog6Tooth />;
  if (href.startsWith("/facilities")) return <HiOutlineUsers />;
  if (href.startsWith("/vendors")) return <HiOutlineUsers />;
  if (href.startsWith("/contracts")) return <HiOutlineDocumentText />;
  if (href.startsWith("/lots")) return <HiOutlineClipboardDocumentList />;
  if (href.startsWith("/bookings")) return <HiOutlineClipboardDocumentList />;
  if (href.startsWith("/finance/payments")) return <HiOutlineCurrencyDollar />;
  if (href.startsWith("/finance")) return <HiOutlineDocumentText />;
  if (href.startsWith("/services")) return <HiOutlineWrenchScrewdriver />;
  if (href.startsWith("/reports")) return <HiOutlineDocumentText />;
  if (href.startsWith("/trends")) return <HiOutlineChartBarSquare />;
  if (href.startsWith("/lab")) return <HiOutlineWrenchScrewdriver />;
  return <HiOutlineUser />;
};

function Sidebar({ isMobileMenuOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const accessibleNavItems = useAccessibleNavItems();

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
      <div className="bg-white rounded-lg shadow p-2 h-full">
        {/* Mobile close button */}
        {isMobileMenuOpen && (
          <div className="flex justify-end mb-2 md:hidden">
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>
        )}

        <nav>
          <ul className="flex flex-col gap-1">
            {accessibleNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-2 text-gray-600 text-sm font-medium px-4 py-2 rounded transition-all ${
                    pathname === item.href
                      ? "bg-gray-200 text-gray-800"
                      : "hover:bg-gray-300 hover:text-gray-800"
                  }`}
                  title={item.description}
                >
                  <span
                    className={`w-5 h-5 ${
                      pathname === item.href
                        ? "text-brand-600"
                        : "text-gray-400"
                    } transition-all`}
                  >
                    {getIconForRoute(item.href)}
                  </span>
                  <span className="text-sm">{item.label}</span>
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
