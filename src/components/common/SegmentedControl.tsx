"use client";

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: React.ReactNode }[];
  className?: string;
}

/**
 * Views within one page.
 *
 * Deliberately unlike the section tabs above it: those move between pages,
 * these switch what a single page shows, and two underlined tab bars stacked
 * on top of each other read as one muddled row.
 *
 * On a phone the pills share the full width and a long label wraps to two
 * lines. Scrolling them, as the section tabs do, hid half of "Pending
 * Installation" behind the edge of a control that gives no sign it scrolls.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={`flex w-full sm:inline-flex sm:w-auto gap-1 rounded-lg bg-slate-100 p-1 ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`flex-1 sm:flex-none sm:whitespace-nowrap leading-tight rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
