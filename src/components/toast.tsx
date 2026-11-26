import type { ReactNode } from "react";

export interface ToastItem {
  id: string; // 👈 Unique ID for each toast
  variant: "success" | "error" | "info" | "warning";
  header?: string | null;
  description?: string | null;
  icon?: ReactNode;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[320px] max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const styles = {
          success: {
            border: "border-emerald-500/50",
            bgIcon: "bg-emerald-500/20",
            iconColor: "#10b981",
          },
          error: {
            border: "border-red-500/50",
            bgIcon: "bg-red-500/20",
            iconColor: "#ef4444",
          },
          warning: {
            border: "border-yellow-500/50",
            bgIcon: "bg-yellow-500/20",
            iconColor: "#eab308",
          },
          info: {
            border: "border-[#FF007F]/50",
            bgIcon: "bg-[#FF007F]/20",
            iconColor: "#FF007F",
          },
        };

        const currentStyle = styles[toast.variant];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-[#1A1A1A] border ${currentStyle.border} text-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300`}
          >
            {/* Icon */}
            {toast.icon && (
              <div className={`w-8 h-8 rounded-full ${currentStyle.bgIcon} flex items-center justify-center shrink-0`}>
                {toast.icon}
              </div>
            )}

            {/* Text Content */}
            <div className="min-w-0 flex-1">
              {toast.header && (
                <p className="font-bold text-sm leading-tight">{toast.header}</p>
              )}
              {toast.description && (
                <p className="text-xs xl:text-sm mt-0.5 text-gray-300">{toast.description}</p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => onClose(toast.id)}
              className="shrink-0 p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close notification"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}