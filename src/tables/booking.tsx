import type { Column } from "../components/data-table";
import type { Booking } from "../interfaces/interface";
import { BookingActions, type ActionLoading } from "./booking-actions";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return "pr-2 bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "approved":
      return "px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "completed":
      return "px-3 py-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "cancelled":
      return "px-3 py-1.5 bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
};

type Handlers = {
  actionLoading: ActionLoading;
  onView: (b: Booking) => void;
  onEdit: (b: Booking) => void;
  onDelete: (b: Booking) => void;
};

export const getBookingColumns = ({
  actionLoading,
  onView,
  onEdit,
  onDelete,
}: Handlers): Column<Booking>[] => [
  {
    header: "Client",
    className: "md: text-left",
    cell: (booking) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FF007F]/20 flex items-center justify-center text-[#FF007F] font-bold text-lg shrink-0">
          {booking.user?.full_name?.charAt(0) || "U"}
        </div>
        <p className="text-white font-bold truncate">
          {booking.user?.full_name || "Unknown User"}
        </p>
      </div>
    ),
  },
  {
    header: "Instagram Username",
    cell: (booking) =>
      booking.ig_username ? (
        <a
          href={`https://www.instagram.com/${booking.ig_username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-white hover:text-white/70 underline italic truncate"
        >
          @{booking.ig_username}
        </a>
      ) : (
        <p className={`block text-white hover:text-white/70 italic truncate`}>No Instagram Name</p>
      ),
  },
  {
    header: "Booked On",
    cell: (booking) => (
      <div className="min-w-0">
        {new Date(booking.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}{" "}
        {new Date(booking.created_at).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}
      </div>
    ),
  },
  {
    header: "Book Date",
    cell: (booking) => (
      <p className="text-sm text-gray-300 font-medium">{booking.date}</p>
    ),
  },
  {
    header: "Book Time",
    cell: (booking) => (
      <p className="text-sm text-gray-300 font-medium">{booking.time}</p>
    ),
  },
  {
    header: "Chosen Service/s",
    cell: (booking) => (
      <div className="flex flex-wrap gap-2">
        {booking.booking_services?.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-white/5 p-1.5 pr-3 rounded-md border border-white/5"
          >
            {item.design?.image_url ? (
              <img
                src={item.design.image_url}
                alt="Design"
                className="w-8 h-10 object-cover rounded"
              />
            ) : item.custom_image_url ? (
              <img
                src={item.custom_image_url}
                alt="Custom"
                className="w-8 h-10 object-cover rounded"
              />
            ) : (
              <div className="w-8 h-10 rounded bg-black/50 border border-white/10 flex items-center justify-center text-gray-500">
                {item.service?.name === "Bespoke Nails" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-sparkles preview-icon text-white/70"
                  >
                    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                    <path d="M20 2v4" />
                    <path d="M22 4h-4" />
                    <circle cx="4" cy="20" r="2" />
                  </svg>
                )}

                {item.service?.name === "Nail Removal" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-eraser preview-icon text-white/70"
                  >
                    <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
                    <path d="m5.082 11.09 8.828 8.828" />
                  </svg>
                )}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-white">
                {item.service?.name}
              </p>
              {item.design && (
                <p className="text-[10px] text-gray-400">{item.design.title}</p>
              )}
              {item.custom_image_url && (
                <p className="text-[10px] text-[#FF007F]">Custom</p>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    header: "Status",
    className: "md:text-left",
    cell: (booking) => (
      <div
        className={`inline-block rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(booking.status)}`}
      >
        {booking.status.toLocaleLowerCase() === "pending" && (
          <span className={`flex items-center`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="30"
              width="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className=" lucide lucide-dot preview-icon animate-pulse"
            >
              <circle cx="12" cy="12" r="1" />
            </svg>{" "}
            {booking.status}
          </span>
        )}
        {booking.status.toLocaleLowerCase() === "approved" && (
          <span className={`flex items-center`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-check preview-icon mr-1"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {booking.status}
          </span>
        )}

        {booking.status.toLocaleLowerCase() === "completed" && (
          <span className={`flex items-center`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-check preview-icon mr-1"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {booking.status}
          </span>
        )}

        {booking.status.toLocaleLowerCase() === "cancelled" && (
          <span className={`flex items-center`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-x preview-icon mr-1"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            {booking.status}
          </span>
        )}
      </div>
    ),
  },
  {
    header: "Actions",
    className: "md:text-center",
    cell: (booking) => (
      <BookingActions
        booking={booking}
        actionLoading={actionLoading}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];
