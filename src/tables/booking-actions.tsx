import type { Booking } from "../interfaces/interface";

export type ActionLoading = {
  type: "view" | "edit" | "delete";
  id: string;
} | null;

type Props = {
  booking: Booking;
  actionLoading: ActionLoading;
  onView: (b: Booking) => void;
  onEdit: (b: Booking) => void;
  onDelete: (b: Booking) => void;
};

function Spinner({ className }: { className: string }) {
  return (
    <svg
      className={`animate-spin h-3 w-3 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function BookingActions({ booking, actionLoading, onView, onEdit, onDelete }: Props) {
  const isLoading = (type: "view" | "edit" | "delete") =>
    actionLoading?.type === type && actionLoading.id === booking.id;

  const base =
    "px-3 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 min-w-[60px] justify-center";

  return (
    <div className="flex justify-start md:justify-end gap-2">
      <button
        onClick={() => onView(booking)}
        disabled={isLoading("view")}
        className={`${base} bg-white/5 hover:bg-white/10 text-white`}
      >
        {isLoading("view") ? <Spinner className="text-white" /> : "View"}
      </button>

      <button
        onClick={() => onEdit(booking)}
        disabled={isLoading("edit")}
        className={`${base} bg-[#FF007F]/10 hover:bg-[#FF007F]/20 text-[#FF007F]`}
      >
        {isLoading("edit") ? <Spinner className="text-[#FF007F]" /> : "Edit"}
      </button>

      <button
        onClick={() => onDelete(booking)}
        disabled={isLoading("delete")}
        className={`${base} bg-red-500/10 hover:bg-red-500/20 text-red-400`}
      >
        {isLoading("delete") ? <Spinner className="text-red-400" /> : "Delete"}
      </button>
    </div>
  );
}