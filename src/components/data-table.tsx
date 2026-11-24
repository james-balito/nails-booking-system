import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="py-20 text-center text-gray-500 flex flex-col items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-[#FF007F] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500 bg-[#1A1A1A]/50 rounded-2xl border border-white/5">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0A0A0A]">
      {/* Desktop Table Header */}
      <div className="hidden md:grid bg-[#1A1A1A] text-xs uppercase tracking-wider text-gray-500 px-6 py-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((col, i) => (
          <div key={i} className={col.className}>{col.header}</div>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            className="flex flex-col md:grid md:items-center gap-4 md:gap-0 px-4 sm:px-6 py-4 hover:bg-white/5 transition-colors"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((col, i) => (
              <div key={i} className={`min-w-0 ${col.className}`}>
                {/* Mobile Labels */}
                <span className="md:hidden block text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  {col.header}
                </span>
                {/* Cell Content */}
                {col.cell
                  ? col.cell(item)
                  : col.accessorKey
                  ? String(item[col.accessorKey] || "—")
                  : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}