import { ReactNode } from "react";

interface PageHeaderProps {
  title: string | ReactNode;
  description?: string;
  action?: ReactNode;
  search?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  action,
  search,
}: PageHeaderProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {typeof title === "string" ? (
            <>
              <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
              {description && (
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              )}
            </>
          ) : (
            title
          )}
        </div>
        {search && <div className="flex-1 max-w-md mx-auto">{search}</div>}
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
