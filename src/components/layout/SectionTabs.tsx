"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSectionTabs } from "@/lib/navigation";

/**
 * The tab bar for a sidebar group.
 *
 * Rendered once by the app layout rather than by each page, so a page joins
 * a group by being listed in NAV_ITEMS and cannot forget its tabs. It shows
 * only on a group's list pages, and only when this user can see two or more
 * of them.
 *
 * On a phone the tabs scroll sideways inside their own strip; the page never
 * does. The active tab is brought into view, since on a narrow screen it can
 * otherwise sit past the edge where nothing says it is selected.
 */
export default function SectionTabs({
  className = "",
}: {
  className?: string;
}) {
  const pathname = usePathname();
  const tabs = useSectionTabs(pathname);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  if (tabs.length === 0) return null;

  return (
    <div className={className}>
      <nav
        aria-label="Section"
        // The edges fade on a phone, so a tab cut off at either side reads as
        // "there is more this way" rather than as a stray fragment of text.
        className="flex gap-1 overflow-x-auto border-b border-slate-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-md:[mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-24px),transparent)]"
      >
        {tabs.map((tab) => {
          const active = tab.href === pathname;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              ref={active ? activeRef : undefined}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
