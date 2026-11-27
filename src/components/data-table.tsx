import type { CSSProperties, ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
  /** Desktop grid track size, e.g. "2fr" or "minmax(220px, 2fr)". Default: minmax(120px, 1fr) */
  width?: string;
  /** Make this cell span the full card width on mobile/tablet */
  fullWidthOnMobile?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
}

const DEFAULT_TRACK = "minmax(120px, 1fr)";

// Row = card on mobile/tablet, grid row on desktop
const ROW =
  "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 p-4 " +
  "rounded-2xl border border-white/10 bg-[#111111] " +
  "lg:rounded-none lg:border-0 lg:bg-transparent lg:px-6 lg:py-4 lg:items-center lg:gap-4 " +
  "lg:[grid-template-columns:var(--cols)]";

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  const gridVars = {
    "--cols": columns.map((c) => c.width ?? DEFAULT_TRACK).join(" "),
    "--table-min": `${columns.length * 130}px`,
  } as CSSProperties;

  const cellClass = (col: Column<T>) =>
    [
      "min-w-0 text-left",
      col.fullWidthOnMobile ? "sm:col-span-2 lg:col-span-1" : "",
      col.className ?? "",
    ].join(" ");

  const shell = (body: ReactNode) => (
    <div className="w-full lg:rounded-2xl lg:border lg:border-white/10 lg:bg-[#0A0A0A] lg:shadow-xl lg:shadow-black/30 lg:overflow-hidden">
      <div className="lg:overflow-x-auto">
        <div
          role="table"
          className="lg:min-w-[var(--table-min)]"
          style={gridVars}
        >
          {/* Desktop header */}
          <div
            role="row"
            className="hidden lg:grid gap-4 px-6 py-3.5 bg-[#1A1A1A]/80 border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-gray-500 [grid-template-columns:var(--cols)]"
          >
            {columns.map((col, i) => (
              <div key={i} role="columnheader" className={`text-left ${col.className ?? ""}`}>
                {col.header}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div role="rowgroup" className="space-y-3 lg:space-y-0 lg:divide-y lg:divide-white/5">
            {body}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (isLoading) {
    return shell(
      Array.from({ length: 5 }).map((_, r) => (
        <div key={r} role="row" className={ROW} style={gridVars} aria-hidden="true">
          {columns.map((col, i) => (
            <div key={i} className={cellClass(col)}>
              <span className="lg:hidden block h-2.5 w-16 rounded bg-white/5 mb-2 animate-pulse" />
              <div
                className="h-4 rounded-md bg-white/5 animate-pulse"
                style={{ width: `${55 + ((r + i) % 4) * 12}%` }}
              />
            </div>
          ))}
        </div>
      )),
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <div className="py-16 px-6 text-center bg-[#1A1A1A]/40 rounded-2xl border border-dashed border-white/10 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#FF007F]/10 flex items-center justify-center text-[#FF007F]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
        </div>
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  // ── Data ─────────────────────────────────────────────────────────────────
  return shell(
    data.map((item) => (
      <div
        key={keyExtractor(item)}
        role="row"
        style={gridVars}
        className={`${ROW} transition-all duration-200 hover:border-[#FF007F]/30 hover:bg-[#161616] lg:hover:border-0 lg:hover:bg-white/[0.03] lg:hover:shadow-[inset_3px_0_0_#FF007F]`}
      >
        {columns.map((col, i) => {
          const fallback =
            col.accessorKey !== undefined
              ? String(item[col.accessorKey] ?? "") || "—"
              : null;

          return (
            <div key={i} role="cell" className={cellClass(col)}>
              {/* Mobile/tablet label */}
              <span className="lg:hidden block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                {col.header}
              </span>
              {col.cell ? col.cell(item) : fallback}
            </div>
          );
        })}
      </div>
    )),
  );
}