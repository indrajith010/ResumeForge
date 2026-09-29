import type { ComponentType, ReactNode } from "react";

interface Props {
  title: string;
  icon?: ComponentType<{ className?: string }>;
  count?: number;
  children: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}

export function Section({ title, icon: Icon, count, children, onAdd, addLabel }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <Icon className="w-4.5 h-4.5" />
            </span>
          )}
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {typeof count === "number" && count > 0 && (
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
              {count}
            </span>
          )}
        </div>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            aria-label={addLabel ?? `Add ${title.toLowerCase()} entry`}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <span aria-hidden="true" className="text-base leading-none">+</span> Add
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function RemoveItemButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute top-3.5 right-3.5 flex items-center justify-center w-7 h-7 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
    >
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center text-sm text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg py-6">
      {label}
    </div>
  );
}
