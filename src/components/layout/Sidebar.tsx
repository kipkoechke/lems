"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  HiOutlineArchiveBox,
  HiOutlineSignal,
  HiOutlineShieldCheck,
  HiOutlineLink,
  HiOutlineTruck,
  HiOutlineChevronRight,
  HiOutlineSquare3Stack3D,
} from "react-icons/hi2";
import {
  useAccessibleNavSections,
  activeNavHref,
  type NavGroupKey,
  type NavItem,
} from "@/lib/navigation";

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onClose?: () => void;
}

/**
 * Above this many entries, the sidebar gathers related items into collapsible
 * sections. Below it a flat list is shorter than the headings would be — a
 * vendor with four entries does not need three of them folded away — so the
 * grouping switches itself off.
 */
const GROUPING_THRESHOLD = 8;

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
  if (href.startsWith("/dashboard")) return <HiOutlineChartBarSquare />;
  if (href.startsWith("/lab")) return <HiOutlineWrenchScrewdriver />;
  return <HiOutlineUser />;
};

const GROUP_ICONS: Record<NavGroupKey, React.ReactNode> = {
  registry: <HiOutlineArchiveBox />,
  devices: <HiOutlineSignal />,
  equipment: <HiOutlineCog6Tooth />,
  reports: <HiOutlineChartBarSquare />,
  administration: <HiOutlineShieldCheck />,
  integrations: <HiOutlineLink />,
  vendor: <HiOutlineTruck />,
  "patient-care": <HiOutlineUsers />,
  finance: <HiOutlineCurrencyDollar />,
};

function Sidebar({ isMobileMenuOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const sections = useAccessibleNavSections();

  const itemCount = useMemo(
    () => sections.reduce((total, section) => total + section.items.length, 0),
    [sections],
  );
  const grouped = itemCount > GROUPING_THRESHOLD;

  const activeHref = activeNavHref(pathname, sections);
  const activeKey = sections.find((section) =>
    section.items.some((item) => item.href === activeHref),
  )?.key;

  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  // Open the section holding the page you are on. Without this, arriving at a
  // page from a link leaves its own entry folded out of sight, and a collapsed
  // column with nothing marked reads as though nothing is current.
  useEffect(() => {
    if (!grouped || !activeKey) return;
    setOpenSections((prev) =>
      prev.has(activeKey) ? prev : new Set(prev).add(activeKey),
    );
  }, [grouped, activeKey]);

  const toggleSection = (key: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const renderItems = (items: NavItem[], nested = false) => (
    <ul className={`flex flex-col gap-1 ${nested ? "mb-1" : ""}`}>
      {items.map((item) => {
        const isActive = item.href === activeHref;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={handleLinkClick}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2 text-gray-600 text-sm font-medium py-2 rounded transition-all ${
                nested ? "pl-6 pr-3" : "px-4"
              } ${
                isActive
                  ? "bg-gray-200 text-gray-800"
                  : "hover:bg-gray-300 hover:text-gray-800"
              }`}
              title={item.description}
            >
              <span
                className={`w-5 h-5 ${
                  isActive ? "text-brand-600" : "text-gray-400"
                } transition-all`}
              >
                {getIconForRoute(item.href)}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

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
          {sections.map((section) => {
            // No heading and no folding: the pinned items, a single entry, or
            // any role whose list is short enough not to need grouping.
            if (!grouped || !section.label) {
              return (
                <div key={section.key} className="mb-1">
                  {renderItems(section.items)}
                </div>
              );
            }

            const isOpen = openSections.has(section.key);
            const holdsActive = section.key === activeKey;

            return (
              <div key={section.key} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  aria-expanded={isOpen}
                  title={section.label}
                  className={`w-full flex items-center gap-2 text-sm font-medium px-4 py-2 rounded transition-all ${
                    holdsActive
                      ? "text-gray-800"
                      : "text-gray-500 hover:bg-gray-300 hover:text-gray-800"
                  }`}
                >
                  <span
                    className={`w-5 h-5 ${
                      holdsActive ? "text-brand-600" : "text-gray-400"
                    } transition-all`}
                  >
                    {GROUP_ICONS[section.key as NavGroupKey] ?? (
                      <HiOutlineSquare3Stack3D />
                    )}
                  </span>
                  <span className="text-sm">{section.label}</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-400">
                      {section.items.length}
                    </span>
                    <HiOutlineChevronRight
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  </span>
                </button>
                {isOpen && renderItems(section.items, true)}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
