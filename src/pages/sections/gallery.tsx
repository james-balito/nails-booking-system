import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import NailsCard from "../../components/nails-card";
import BookingCalendar from "../../components/booking-calendar";
import supabase from "../../config/supabaseClient";
import { listDesigns } from "../../api/designs";
import { listServices, type Service } from "../../api/services";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface NailData {
  id: string;
  img: string;
  title: string;
  description: string;
  shape: string;
  colors: string[];
  designs: string[];
}

export type BookingIntent = {
  target: "Selection" | "BespokeSelection" | "Removal" | "Custom";
  serviceName?: string;
  nonce: number;
};

interface GalleryProps {
  bookingIntent?: BookingIntent | null;
  onIntentHandled?: () => void;
  onScrollToGallery?: () => void;
}

type BookingScreen = "Selection" | "Custom" | "Form" | null;

type Notice = {
  tone: "error" | "info" | "success";
  title: string;
  message: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────

const ring =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF007F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]";

const btnPrimary = `inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF007F] text-white font-bold hover:bg-[#ff1a8c] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${ring}`;

const btnGhost = `inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 active:scale-[0.98] transition-all ${ring}`;

const fieldCls =
  "w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 transition-colors focus:outline-none focus:border-[#FF007F] focus:ring-2 focus:ring-[#FF007F]/30";

const igCls =
  "pl-7.5 w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 transition-colors focus:outline-none focus:border-[#FF007F] focus:ring-2 focus:ring-[#FF007F]/30";

const labelCls = "block text-sm font-semibold text-gray-300 mb-2";

// ─────────────────────────────────────────────────────────────────────────────
// Icons (one place instead of dozens of inline SVGs)
// ─────────────────────────────────────────────────────────────────────────────

const ICONS = {
  close: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  alert: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  sparkles: (
    <>
      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
      <path d="M20 2v4" />
      <path d="M22 4h-4" />
      <circle cx="4" cy="20" r="2" />
    </>
  ),
  eraser: (
    <>
      <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
      <path d="m5.082 11.09 8.828 8.828" />
    </>
  ),
  palette: (
    <>
      <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    </>
  ),
  gallery: (
    <>
      <path d="M2 3v18" />
      <rect width="12" height="18" x="6" y="3" rx="2" />
      <path d="M22 3v18" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </>
  ),
  minimize: (
    <>
      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </>
  ),
  sliders: (
    <>
      <line x1="21" x2="14" y1="4" y2="4" />
      <line x1="10" x2="3" y1="4" y2="4" />
      <line x1="21" x2="12" y1="12" y2="12" />
      <line x1="8" x2="3" y1="12" y2="12" />
      <line x1="21" x2="16" y1="20" y2="20" />
      <line x1="12" x2="3" y1="20" y2="20" />
      <line x1="14" x2="14" y1="2" y2="6" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="16" x2="16" y1="18" y2="22" />
    </>
  ),
} satisfies Record<string, ReactNode>;

type IconName = keyof typeof ICONS;

function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  className = "",
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {ICONS[name]}
    </svg>
  );
}

const serviceIcon = (slug: string): IconName | null => {
  const s = slug.toLowerCase();
  if (s === "bespoke") return "sparkles";
  if (s === "removal") return "eraser";
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks & helpers
// ─────────────────────────────────────────────────────────────────────────────

// Keeps a modal mounted long enough for its exit animation
function useModalAnimation(isOpen: boolean, duration = 300) {
  const [isVisible, setIsVisible] = useState(isOpen);
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);
  return isVisible;
}

// Locks page scroll (html + body) while a modal is open, without the layout
// jumping when the scrollbar disappears.
function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      html: html.style.overflow,
      body: body.style.overflow,
      pad: body.style.paddingRight,
    };
    const scrollbar = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      html.style.overflow = prev.html;
      body.style.overflow = prev.body;
      body.style.paddingRight = prev.pad;
    };
  }, [locked]);
}

// Spread on a fixed overlay so wheel/touch scrolling stays inside it.
// `data-lenis-prevent` tells Lenis (smooth-scroll libs) to leave it alone;
// stopPropagation keeps other window-level scroll handlers from hijacking it.
const scrollGuard = {
  "data-lenis-prevent": "",
  onWheel: (e: React.WheelEvent) => e.stopPropagation(),
  onTouchMove: (e: React.TouchEvent) => e.stopPropagation(),
};

// Renders overlays directly under <body> so no transformed or scrolling
// ancestor can affect `position: fixed` or capture the scroll.
function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}

// Maps a DB design row to the shape used by the gallery UI
const mapDesign = (d: {
  id: string;
  image_url: string;
  title: string;
  description: string;
  shape: string;
  colors: string[];
  designs: string[];
}): NailData => ({
  id: d.id,
  img: d.image_url,
  title: d.title,
  description: d.description,
  shape: d.shape,
  colors: d.colors,
  designs: d.designs,
});

const formatSlot = (date: string, time: string) => {
  if (!date) return "";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : date;
  return time ? `${d} at ${time}` : d;
};

// ─────────────────────────────────────────────────────────────────────────────
// Small presentational components
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ notice }: { notice: Notice | null }) {
  if (!notice) return null;
  const tones = {
    error: {
      border: "border-red-500/30",
      iconWrap: "bg-red-500/15 text-red-400",
      icon: "alert" as IconName,
    },
    info: {
      border: "border-[#FF007F]/40",
      iconWrap: "bg-[#FF007F]/15 text-[#FF007F]",
      icon: "info" as IconName,
    },
    success: {
      border: "border-emerald-500/30",
      iconWrap: "bg-emerald-500/15 text-emerald-400",
      icon: "check" as IconName,
    },
  }[notice.tone];

  return (
    <div
      role={notice.tone === "error" ? "alert" : "status"}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[10002] w-[calc(100vw-2rem)] sm:w-auto max-w-sm animate-in slide-in-from-top-4 fade-in duration-300"
    >
      <div
        className={`bg-[#1A1A1A] border ${tones.border} text-white px-4 py-3 sm:px-5 sm:py-4 rounded-2xl shadow-2xl flex items-center gap-3`}
      >
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tones.iconWrap}`}
        >
          <Icon name={tones.icon} size={18} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm">{notice.title}</p>
          <p className="text-xs sm:text-sm text-gray-400">{notice.message}</p>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialogInner({
  tone = "brand",
  icon,
  title,
  children,
  preview,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  footerAction,
}: {
  tone?: "brand" | "danger";
  icon: IconName;
  title: string;
  children: ReactNode;
  preview?: { img: string; label: string; name: string; faded?: boolean };
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  footerAction?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const danger = tone === "danger";

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      {...scrollGuard}
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center sm:p-4"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full sm:max-w-md xl:max-w-lg max-h-[92dvh] overflow-y-auto bg-[#1A1A1A] border border-white/10 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 xl:p-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl text-center outline-none animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto ${
            danger
              ? "bg-red-500/10 text-red-500"
              : "bg-[#FF007F]/10 text-[#FF007F]"
          }`}
        >
          <Icon name={icon} size={28} />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-400 mb-5 leading-relaxed">{children}</p>

        {preview && (
          <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10 mb-5 text-left">
            <img
              src={preview.img}
              alt=""
              className={`w-14 h-[4.5rem] sm:w-16 sm:h-20 object-cover rounded-lg shrink-0 ${
                preview.faded ? "opacity-70" : ""
              }`}
            />
            <div className="min-w-0">
              <p
                className={`text-xs font-semibold ${
                  preview.faded ? "text-red-400" : "text-[#FF007F]"
                }`}
              >
                {preview.label}
              </p>
              <p className="text-white font-bold text-sm sm:text-base truncate">
                {preview.name}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 py-3 text-sm ${btnGhost}`}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-sm ${
              danger
                ? `rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 active:scale-[0.98] transition-all ${ring}`
                : btnPrimary
            }`}
          >
            {confirmLabel}
          </button>
        </div>
        {footerAction}
      </div>
    </div>
  );
}

function ConfirmDialog(props: Parameters<typeof ConfirmDialogInner>[0]) {
  return (
    <Portal>
      <ConfirmDialogInner {...props} />
    </Portal>
  );
}

function ChipGroup({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-semibold text-gray-400 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs sm:text-sm text-white"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Gallery
// ─────────────────────────────────────────────────────────────────────────────

export default function Gallery({
  bookingIntent,
  onIntentHandled,
  onScrollToGallery,
}: GalleryProps) {
  const navigate = useNavigate();

  // Gallery Data States
  const [images, setImages] = useState<NailData[]>([]);
  const [pendingDesignChange, setPendingDesignChange] =
    useState<NailData | null>(null);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [designsError, setDesignsError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Services Data States
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Filter States
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [showFilters, setShowFilters] = useState(false); // mobile only

  // Modal States
  const [selectedNail, setSelectedNail] = useState<NailData | null>(null);

  // Booking flow state
  const [bookingScreen, setBookingScreen] = useState<BookingScreen>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<NailData | null>(null);
  const [pendingServices, setPendingServices] = useState<Service[]>([]);

  // When true the slide-over is hidden but the draft is kept
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);

  // Custom service the user wants to switch to, waiting for confirmation
  const [pendingCustomService, setPendingCustomService] =
    useState<Service | null>(null);

  // Notifications (validation, login required, success, errors)
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Booking Form States
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [igUsername, setIgUsername] = useState("");
  const [customImage, setCustomImage] = useState<File | null>(null);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBookingOpen =
    !isPanelMinimized && (bookingScreen !== null || selectedDesign !== null);

  const hasTypedData = !!(selectedDate || selectedTime || notes || customImage);
  const hasDraft =
    selectedDesign !== null || selectedServices.length > 0 || hasTypedData;
  const hasCustomSelected = selectedServices.some((s) => s.slug === "custom");

  const isDetailsVisible = useModalAnimation(!!selectedNail);
  const isBookingVisible = useModalAnimation(isBookingOpen);

  useLockBodyScroll(
    isBookingVisible ||
      isDetailsVisible ||
      !!pendingDesignChange ||
      !!pendingCustomService ||
      showCancelConfirm,
  );

  const gridRef = useRef<HTMLDivElement>(null);

  // Preview for the uploaded inspiration photo
  const customPreview = useMemo(
    () => (customImage ? URL.createObjectURL(customImage) : null),
    [customImage],
  );
  useEffect(() => {
    return () => {
      if (customPreview) URL.revokeObjectURL(customPreview);
    };
  }, [customPreview]);

  const notify = (n: Notice, ms = 3000) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice(n);
    noticeTimer.current = setTimeout(() => setNotice(null), ms);
  };
  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  const showValidationError = (msg: string) =>
    notify({ tone: "info", title: "Missing information", message: msg });

  // ── Fetch Services & Designs ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoadingDesigns(true);
    setLoadingServices(true);
    setDesignsError(null);
    (async () => {
      try {
        const [designsData, servicesData] = await Promise.all([
          listDesigns({ includeInactive: false, pageSize: 100 }),
          listServices(),
        ]);

        if (cancelled) return;

        setImages(designsData.data.map(mapDesign));
        setServices(servicesData);
      } catch (err: any) {
        if (!cancelled) {
          setDesignsError(err.message ?? "Failed to load data");
        }
      } finally {
        if (!cancelled) {
          setLoadingDesigns(false);
          setLoadingServices(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Re-fetch gallery when user switches back to the browser tab
  useEffect(() => {
    const handleFocus = () => {
      if (!loadingDesigns) {
        listDesigns({ includeInactive: false, pageSize: 100 })
          .then(({ data }) => setImages(data.map(mapDesign)))
          .catch(() => {});
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadingDesigns]);

  // ── Design selection helpers ──────────────────────────────────────────────

  const withGalleryServices = (base: Service[]) => {
    const gallery = services.find((s) => s.slug === "gallery-selection");
    if (!gallery) return base;
    const parent = gallery.parent_id
      ? services.find((s) => s.id === gallery.parent_id)
      : undefined;
    const merged = [...base];
    [parent, gallery].forEach((s) => {
      if (s && !merged.some((x) => x.id === s.id)) merged.push(s);
    });
    return merged;
  };

  const applyDesign = (design: NailData) => {
    const base = (
      pendingServices.length > 0 ? pendingServices : selectedServices
    ).filter((s) => s.slug !== "custom");
    setSelectedServices(withGalleryServices(base));
    setCustomImage(null);
    setSelectedDesign(design);
    setPendingServices([]);
    setBookingScreen("Form");
    setIsPanelMinimized(false);
  };

  const handleBookDesign = (newDesign: NailData) => {
    if (
      (selectedDesign && selectedDesign.id !== newDesign.id) ||
      (!selectedDesign && hasCustomSelected)
    ) {
      setPendingDesignChange(newDesign);
      return;
    }
    applyDesign(newDesign);
  };

  const requestCustom = (customService: Service) => {
    if (hasCustomSelected) {
      setBookingScreen("Form");
      setIsPanelMinimized(false);
      return;
    }
    setPendingCustomService(customService);
  };

  const applyCustom = (customService: Service) => {
    setSelectedDesign(null);
    setPendingServices([]);
    setSelectedServices((prev) => {
      const withoutGallery = prev.filter((s) => s.slug !== "gallery-selection");
      return withoutGallery.some((s) => s.id === customService.id)
        ? withoutGallery
        : [...withoutGallery, customService];
    });
    setBookingScreen("Form");
    setIsPanelMinimized(false);
  };

  // Extract Unique Filters
  const allShapes = useMemo(
    () => Array.from(new Set(images.map((img) => img.shape))),
    [images],
  );
  const allColors = useMemo(
    () => Array.from(new Set(images.flatMap((img) => img.colors))),
    [images],
  );
  const allDesigns = useMemo(
    () => Array.from(new Set(images.flatMap((img) => img.designs))),
    [images],
  );

  // Filter Logic
  const filteredImages = useMemo(() => {
    if (selectedFilters.length === 0) return images;
    return images.filter((image) =>
      selectedFilters.every((filterValue) => {
        if (image.shape === filterValue) return true;
        if (image.colors.includes(filterValue)) return true;
        if (image.designs.includes(filterValue)) return true;
        return false;
      }),
    );
  }, [selectedFilters, images]);

  const visibleImages = filteredImages.slice(0, visibleCount);

  const toggleFilter = (value: string) => {
    setSelectedFilters((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
    setVisibleCount(12);
  };

  // ── Booking Flow Helpers ──────────────────────────────────────────────────
  const resetBooking = () => {
    setBookingScreen(null);
    setSelectedServices([]);
    setSelectedDesign(null);
    setSelectedDate("");
    setSelectedTime("");
    setNotes("");
    setIgUsername("");
    setCustomImage(null);
    setShowCancelConfirm(false);
    setIsPanelMinimized(false);
  };

  const removeSelection = () => {
    setBookingScreen("Selection");
    setSelectedServices([]);
    setSelectedDesign(null);
    setSelectedDate("");
    setSelectedTime("");
    setNotes("");
    setCustomImage(null);
  };

  // Handle external booking intents (Navbar, etc.)
  useEffect(() => {
    if (!bookingIntent) return;
    onScrollToGallery?.();
    setSelectedDesign(null);
    setSelectedServices([]);
    setIsPanelMinimized(false);
    setBookingScreen(
      bookingIntent.target === "Selection" ? "Selection" : "Form",
    );
    setShowCancelConfirm(false);
    onIntentHandled?.();
  }, [bookingIntent, onIntentHandled, onScrollToGallery]);

  const handleCloseAttempt = () => {
    if (showCancelConfirm) {
      setShowCancelConfirm(false);
      return;
    }
    if (hasDraft) setShowCancelConfirm(true);
    else resetBooking();
  };

  const handleDiscardDraft = () => {
    if (hasDraft) {
      setShowCancelConfirm(true);
    } else {
      resetBooking();
    }
  };

  // Escape key closes the booking
  useEffect(() => {
    if (!isBookingOpen && !showCancelConfirm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (pendingDesignChange || pendingCustomService) return;
      handleCloseAttempt();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // Escape key closes the details modal
  useEffect(() => {
    if (!selectedNail) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedNail(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedNail]);

  const toggleService = (service: Service) => {
    const isRemoving = selectedServices.some((s) => s.id === service.id);
    const children = services.filter((c) => c.parent_id === service.id);

    if (isRemoving) {
      if (children.some((c) => c.slug === "gallery-selection"))
        setSelectedDesign(null);
      if (children.some((c) => c.slug === "custom")) setCustomImage(null);
    }

    setSelectedServices((prev) =>
      isRemoving
        ? prev.filter(
            (s) => s.id !== service.id && !children.some((c) => c.id === s.id),
          )
        : [...prev, service],
    );
  };

  // ── Handle Booking Submission ─────────────────────────────────────────────
  const handleConfirmBooking = async () => {
    // 1. Ask Supabase directly who is logged in (bypasses AuthContext issues)
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      resetBooking();
      notify(
        {
          tone: "error",
          title: "Login required",
          message: "Please log in to book an appointment.",
        },
        2500,
      );
      setTimeout(() => navigate("/login"), 2500);
      return;
    }

    const currentUserId = session.user.id;

    // Validation Inputs as required
    if (!selectedDate) return showValidationError("Please select a date.");
    if (!selectedTime) return showValidationError("Please select a time.");
    if (selectedServices.length === 0)
      return showValidationError("Please select at least one service.");
    if (selectedServices.some((s) => s.slug === "custom") && !customImage)
      return showValidationError(
        "Please upload an inspiration photo for your custom set.",
      );
    if (!igUsername.trim()) {
      return showValidationError("Please enter your Instagram username.");
    }

    setIsSubmitting(true);
    let uploadedImageUrl: string | null = null;

    try {
      // 2. Upload custom image (if needed)
      const wantsCustomImage = selectedServices.some(
        (s) => s.slug === "custom",
      );
      if (wantsCustomImage && customImage) {
        const ext = customImage.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${currentUserId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("custom-inspirations")
          .upload(path, customImage, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data: signed, error: signErr } = await supabase.storage
          .from("custom-inspirations")
          .createSignedUrl(path, 60 * 60 * 24 * 30);

        if (signErr) throw signErr;
        uploadedImageUrl = signed.signedUrl;
      }

      // 3. Insert into `bookings` using the direct UUID
      const { data: booking, error: dbError } = await supabase
        .from("bookings")
        .insert({
          user_id: currentUserId,
          date: selectedDate,
          time: selectedTime,
          notes: notes,
          ig_username: igUsername,
          // Status is NOT included. Let the DB default to 'pending'
        })
        .select()
        .single();

      if (dbError) {
        console.error("DB ERROR:", dbError);
        throw dbError;
      }

      // 4. Insert the junction records
      const bookingServicesData = selectedServices.map((service) => ({
        booking_id: booking.id,
        service_id: service.id,
        design_id:
          service.slug === "gallery-selection"
            ? selectedDesign?.id || null
            : null,
        custom_image_url: service.slug === "custom" ? uploadedImageUrl : null,
      }));

      const { error: junctionError } = await supabase
        .from("booking_services")
        .insert(bookingServicesData);

      if (junctionError) {
        console.error("JUNCTION ERROR:", junctionError);
        throw junctionError;
      }

      resetBooking();
      notify(
        {
          tone: "success",
          title: "Booking request sent",
          message: "We'll review and confirm shortly.",
        },
        5000,
      );
    } catch (error: any) {
      console.error("FULL ERROR OBJECT:", error);
      notify(
        {
          tone: "error",
          title: "Couldn't submit your booking",
          message: error?.message ?? "Please try again.",
        },
        5000,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // GSAP Animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!gridRef.current || loadingDesigns) return;
      const cardsToAnimate = gridRef.current.querySelectorAll(
        ".nails-card.opacity-0",
      );
      if (cardsToAnimate.length === 0) return;

      const reduceMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        gsap.set(cardsToAnimate, { y: 0, opacity: 1, scale: 1 });
        cardsToAnimate.forEach((card) => card.classList.remove("opacity-0"));
        return;
      }

      gsap.to(cardsToAnimate, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
        onComplete: () =>
          cardsToAnimate.forEach((card) => card.classList.remove("opacity-0")),
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [visibleCount, selectedFilters, loadingDesigns]);

  // ── Derived Values ────────────────────────────────────────────────────────
  const needsCustomImage = selectedServices.some((s) => s.slug === "custom");
  const bookingHeaderTitle =
    selectedServices.length > 1
      ? "Combo booking"
      : selectedServices.length === 1
        ? selectedServices[0].name
        : "New booking";
  const isFormScreen =
    bookingScreen === "Form" ||
    selectedDesign !== null ||
    selectedServices.length > 0;
  const showFormScreen = isFormScreen && bookingScreen === "Form";
  const showSelectionScreen = bookingScreen === "Selection";
  const step = showSelectionScreen ? 1 : 2;
  const slotText = formatSlot(selectedDate, selectedTime);

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-10 xl:px-16 max-w-[1600px] mx-auto relative">
      <Portal>
        <Toast notice={notice} />
      </Portal>

      {/* FLOATING GALLERY BANNER */}
      {pendingServices.length > 0 && (
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6 left-1/2 -translate-x-1/2 z-[9990] w-[calc(100vw-2rem)] sm:w-auto sm:max-w-[90vw] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#1A1A1A] border border-[#FF007F]/50 text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-full shadow-[0_0_40px_rgba(255,0,127,0.3)] flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 rounded-full bg-[#FF007F]/20 text-[#FF007F] flex items-center justify-center shrink-0">
              <Icon name="gallery" size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-snug">
                Pick a design for your booking
              </p>
              <p className="text-xs text-gray-400 leading-snug">
                {pendingServices.map((s) => s.name).join(" + ")}. Tap "Book this
                look" on any design.
              </p>
            </div>
            <button
              onClick={() => setPendingServices([])}
              aria-label="Cancel design selection"
              className={`shrink-0 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors ${ring}`}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* BOOKING IN PROGRESS BAR */}
      {isPanelMinimized && hasDraft && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9990] w-[calc(100vw-2rem)] sm:w-auto sm:max-w-[90vw] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-[#1A1A1A] border border-[#FF007F]/50 text-white p-2.5 sm:pl-3 sm:pr-3 rounded-2xl sm:rounded-full shadow-[0_0_40px_rgba(255,0,127,0.3)] flex items-center gap-2 sm:gap-3">
            {selectedDesign && (
              <img
                src={selectedDesign.img}
                alt=""
                className="w-9 h-11 sm:w-10 sm:h-12 object-cover rounded-md shrink-0"
              />
            )}
            <div className="min-w-0 flex-1 sm:flex-none">
              <p className="text-sm font-bold">Booking in progress</p>
              <p className="text-xs text-gray-400 truncate sm:max-w-[220px] xl:max-w-xs">
                {selectedDesign
                  ? selectedDesign.title
                  : selectedServices.map((s) => s.name).join(" + ") ||
                    "Your booking"}
              </p>
            </div>
            <button
              onClick={() => setIsPanelMinimized(false)}
              className={`shrink-0 px-4 py-2 text-xs ${btnPrimary} rounded-full`}
            >
              Resume
            </button>
            <button
              onClick={handleDiscardDraft}
              aria-label="Discard booking"
              className={`shrink-0 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors ${ring}`}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOGS */}
      {pendingDesignChange && (selectedDesign || hasCustomSelected) && (
        <ConfirmDialog
          icon="alert"
          title="Change your design?"
          preview={{
            img: pendingDesignChange.img,
            label: "New selection",
            name: pendingDesignChange.title,
          }}
          confirmLabel="Yes, change it"
          cancelLabel="Keep current"
          onCancel={() => setPendingDesignChange(null)}
          onConfirm={() => {
            const next = pendingDesignChange;
            setPendingDesignChange(null);
            if (next) applyDesign(next);
          }}
        >
          {selectedDesign ? (
            <>
              You already picked{" "}
              <strong className="text-white">"{selectedDesign.title}"</strong>.
              Switch to{" "}
              <strong className="text-white">
                "{pendingDesignChange.title}"
              </strong>
              ?
            </>
          ) : (
            <>
              You chose the{" "}
              <strong className="text-white">custom nail set</strong>. Picking{" "}
              <strong className="text-white">
                "{pendingDesignChange.title}"
              </strong>{" "}
              will remove it{customImage ? " and your uploaded photo" : ""}.
              Continue?
            </>
          )}
        </ConfirmDialog>
      )}

      {pendingCustomService && (
        <ConfirmDialog
          icon="palette"
          title="Book a custom nail set?"
          preview={
            selectedDesign
              ? {
                  img: selectedDesign.img,
                  label: "Will be removed",
                  name: selectedDesign.title,
                  faded: true,
                }
              : undefined
          }
          confirmLabel="Yes, go custom"
          cancelLabel="Cancel"
          onCancel={() => setPendingCustomService(null)}
          onConfirm={() => {
            const next = pendingCustomService;
            setPendingCustomService(null);
            if (next) applyCustom(next);
          }}
        >
          {selectedDesign ? (
            <>
              Choosing a custom set will remove your selected design{" "}
              <strong className="text-white">"{selectedDesign.title}"</strong>.
              You'll upload your inspiration photo on the next step.
            </>
          ) : (
            <>
              You'll upload your inspiration photo or Pinterest reference on the
              next step so we can recreate it for you.
            </>
          )}
        </ConfirmDialog>
      )}

      {showCancelConfirm && (
        <ConfirmDialog
          tone="danger"
          icon="alert"
          title="Discard this booking?"
          confirmLabel="Yes, discard"
          cancelLabel="Keep booking"
          onCancel={() => setShowCancelConfirm(false)}
          onConfirm={resetBooking}
          footerAction={
            !isPanelMinimized ? (
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setIsPanelMinimized(true);
                }}
                className={`mt-4 inline-flex items-center gap-1.5 text-sm text-[#FF007F] hover:text-white transition-colors rounded-md ${ring}`}
              >
                <Icon name="minimize" size={14} />
                Minimize and keep browsing designs
              </button>
            ) : undefined
          }
        >
          Your selected services, design, date, time, and notes will be lost.
        </ConfirmDialog>
      )}

      {/* BOOKING SLIDE-OVER */}
      {isBookingVisible && (
        <Portal>
          <div
            {...scrollGuard}
            className="fixed inset-0 z-[9999] flex justify-end overflow-hidden"
          >
            <div
              className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isBookingOpen ? "opacity-100" : "opacity-0"}`}
              onClick={handleCloseAttempt}
            />

            <aside
              role="dialog"
              aria-modal="true"
              aria-label={bookingHeaderTitle}
              className={`relative w-full sm:max-w-md lg:max-w-lg xl:max-w-xl bg-[#0A0A0A] h-full shadow-2xl border-l border-white/10 flex flex-col transition-transform duration-300 ease-in-out motion-reduce:transition-none ${isBookingOpen ? "translate-x-0" : "translate-x-full"}`}
            >
              {/* Header */}
              <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4 border-b border-white/10 bg-[#1A1A1A]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl xl:text-2xl font-bold text-white playfair-display-header truncate">
                      {bookingHeaderTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                      Step {step} of 2:{" "}
                      {step === 1 ? "Choose your services" : "Your details"}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseAttempt}
                    aria-label="Close booking"
                    className={`shrink-0 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 ${ring}`}
                  >
                    <Icon name="close" />
                  </button>
                </div>
                <div className="flex gap-1.5 mt-4" aria-hidden="true">
                  <span className="h-1 flex-1 rounded-full bg-[#FF007F]" />
                  <span
                    className={`h-1 flex-1 rounded-full transition-colors ${step === 2 ? "bg-[#FF007F]" : "bg-white/10"}`}
                  />
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* 1. SELECTION SCREEN */}
                {showSelectionScreen && (
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <p className="text-gray-400 text-sm">
                      Select everything you'd like to book together.
                    </p>

                    {loadingServices ? (
                      <div className="space-y-3" aria-busy="true">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-24 rounded-2xl bg-[#1A1A1A] border border-white/5 animate-pulse"
                          />
                        ))}
                      </div>
                    ) : services.length === 0 ? (
                      <div className="text-center text-red-400 py-10 text-sm">
                        No services are available right now.
                      </div>
                    ) : (
                      services
                        .filter((s) => !s.parent_id)
                        .map((service) => {
                          const isSelected = selectedServices.some(
                            (s) => s.id === service.id,
                          );
                          const children = services.filter(
                            (c) => c.parent_id === service.id,
                          );
                          const hasChildren = children.length > 0;
                          const iconName = serviceIcon(service.slug);

                          return (
                            <div
                              key={service.id}
                              className={`rounded-2xl border transition-all ${
                                isSelected
                                  ? "border-[#FF007F] bg-[#FF007F]/5 shadow-[0_0_30px_rgba(255,0,127,0.12)]"
                                  : "border-white/10 bg-[#1A1A1A] hover:border-white/20"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => toggleService(service)}
                                aria-pressed={isSelected}
                                className={`w-full flex items-center gap-4 p-4 sm:p-5 text-left rounded-2xl ${ring}`}
                              >
                                <span
                                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors ${
                                    isSelected
                                      ? "bg-[#FF007F] border-[#FF007F] text-white"
                                      : "border-gray-500"
                                  }`}
                                >
                                  {isSelected && (
                                    <Icon
                                      name="check"
                                      size={14}
                                      strokeWidth={3}
                                    />
                                  )}
                                </span>
                                {iconName && (
                                  <span
                                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                                      isSelected
                                        ? "bg-[#FF007F]/20 text-[#FF007F]"
                                        : "bg-white/5 text-gray-300"
                                    }`}
                                  >
                                    <Icon name={iconName} size={20} />
                                  </span>
                                )}
                                <span className="min-w-0">
                                  <span className="block text-white font-bold text-base sm:text-lg">
                                    {service.name}
                                  </span>
                                  {service.description && (
                                    <span className="block text-xs sm:text-sm text-gray-400 mt-0.5">
                                      {service.description}
                                    </span>
                                  )}
                                </span>
                              </button>

                              {/* Sub-options */}
                              {isSelected &&
                                hasChildren &&
                                !hasCustomSelected && (
                                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-4 border-t border-white/10">
                                    <p className="text-sm font-semibold text-white mb-3">
                                      How would you like to choose your set?
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                      {children.map((child) => (
                                        <button
                                          key={child.id}
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (
                                              child.slug === "gallery-selection"
                                            ) {
                                              const servicesToSave = [
                                                ...selectedServices,
                                              ];
                                              if (
                                                !servicesToSave.some(
                                                  (s) => s.id === child.id,
                                                )
                                              )
                                                servicesToSave.push(child);
                                              setPendingServices(
                                                servicesToSave,
                                              );
                                              resetBooking();
                                              if (onScrollToGallery)
                                                setTimeout(
                                                  () => onScrollToGallery(),
                                                  150,
                                                );
                                            } else {
                                              requestCustom(child);
                                            }
                                          }}
                                          className={`group flex items-center gap-3 py-3 px-3.5 rounded-xl border border-white/10 bg-black text-white text-sm font-semibold hover:border-[#FF007F]/60 hover:text-[#FF007F] transition-all text-left ${ring}`}
                                        >
                                          {child.slug === "custom" && (
                                            <Icon name="palette" />
                                          )}
                                          {child.slug ===
                                            "gallery-selection" && (
                                            <Icon name="gallery" />
                                          )}
                                          {child.name}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {/* Custom already selected */}
                              {isSelected &&
                                hasChildren &&
                                hasCustomSelected && (
                                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                                    <p className="flex items-center gap-2 text-sm text-white">
                                      <Icon
                                        name="check"
                                        size={16}
                                        strokeWidth={3}
                                        className="text-[#FF007F]"
                                      />
                                      Custom nail set selected
                                    </p>
                                    <button
                                      onClick={() => {
                                        setSelectedServices((prev) =>
                                          prev.filter(
                                            (s) => s.slug !== "custom",
                                          ),
                                        );
                                        setCustomImage(null);
                                      }}
                                      className={`text-sm text-red-400 hover:text-red-300 rounded-md ${ring}`}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )}
                            </div>
                          );
                        })
                    )}
                  </div>
                )}

                {/* 2. FORM SCREEN */}
                {showFormScreen && (
                  <>
                    {/* Booking summary */}
                    <section className="rounded-2xl border border-white/10 bg-[#1A1A1A] p-4 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-white">
                          Your booking
                        </h3>
                        <button
                          onClick={removeSelection}
                          className={`text-sm text-red-400 hover:text-red-300 rounded-md ${ring}`}
                        >
                          Clear all
                        </button>
                      </div>

                      {selectedDesign &&
                        selectedServices.some(
                          (s) => s.slug === "gallery-selection",
                        ) && (
                          <div className="flex gap-4 items-center">
                            <img
                              src={selectedDesign.img}
                              alt={selectedDesign.title}
                              className="w-16 h-20 object-cover rounded-xl shrink-0 border border-white/10"
                            />
                            <div className="min-w-0">
                              <p className="text-white font-bold truncate">
                                {selectedDesign.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                From the gallery
                              </p>
                              <button
                                onClick={() => {
                                  setIsPanelMinimized(true);
                                  setTimeout(() => onScrollToGallery?.(), 150);
                                }}
                                className={`mt-2 text-sm text-[#FF007F] hover:text-white transition-colors rounded-md ${ring}`}
                              >
                                Change design
                              </button>
                            </div>
                          </div>
                        )}

                      <ul className="flex flex-wrap gap-2">
                        {selectedServices.map((s) => (
                          <li
                            key={s.id}
                            className="px-3 py-1 rounded-full bg-[#FF007F]/10 border border-[#FF007F]/30 text-[#FF007F] text-xs sm:text-sm font-semibold"
                          >
                            {s.name}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => setBookingScreen("Selection")}
                        className={`inline-flex items-center gap-1.5 text-sm text-[#FF007F] hover:text-white transition-colors rounded-md ${ring}`}
                      >
                        <Icon name="plus" size={14} />
                        Add another service
                      </button>
                    </section>

                    {/* Date & time */}
                    <section>
                      <h3 className={labelCls}>Choose a date and time</h3>
                      <BookingCalendar
                        onDateSelect={(date) => {
                          setSelectedDate(date);
                          setSelectedTime(""); // Reset time when date changes
                        }}
                        onTimeSelect={(time) => setSelectedTime(time)}
                      />
                    </section>

                    {/* Inspiration upload */}
                    {needsCustomImage && (
                      <section>
                        <label htmlFor="inspo-upload" className={labelCls}>
                          Inspiration photo{" "}
                          <span className="text-[#FF007F] font-normal">
                            (required)
                          </span>
                        </label>
                        {customPreview ? (
                          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#1A1A1A] p-3">
                            <img
                              src={customPreview}
                              alt="Your inspiration"
                              className="w-20 h-24 object-cover rounded-xl shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-white font-semibold truncate">
                                {customImage?.name}
                              </p>
                              <div className="flex gap-4 mt-2">
                                <label
                                  htmlFor="inspo-upload"
                                  className="text-sm text-[#FF007F] hover:text-white cursor-pointer transition-colors"
                                >
                                  Replace
                                </label>
                                <button
                                  onClick={() => setCustomImage(null)}
                                  className={`text-sm text-red-400 hover:text-red-300 rounded-md ${ring}`}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="inspo-upload"
                            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-black/40 px-4 py-8 text-center cursor-pointer hover:border-[#FF007F]/60 hover:bg-[#FF007F]/5 transition-colors"
                          >
                            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#FF007F]/10 text-[#FF007F]">
                              <Icon name="upload" />
                            </span>
                            <span className="text-sm font-semibold text-white">
                              Upload a photo
                            </span>
                            <span className="text-xs text-gray-500">
                              A screenshot or Pinterest pin works great
                            </span>
                          </label>
                        )}
                        <input
                          id="inspo-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setCustomImage(
                              e.target.files ? e.target.files[0] : null,
                            )
                          }
                          className="sr-only"
                        />
                      </section>
                    )}

                    {/* Contact + notes */}
                    <section className="space-y-4">
                      <div>
                        <label htmlFor="ig-username" className={labelCls}>
                          Instagram username
                        </label>

                        <div className="relative">
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold transition-colors ${
                              igUsername ? "text-[#FF007F]" : "text-gray-500"
                            }`}
                          >
                            @
                          </span>
                          <input
                            id="ig-username"
                            value={igUsername}
                            onChange={(e) => setIgUsername(e.target.value)}
                            className={igCls}
                            placeholder="yourhandle"
                            autoComplete="off"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="notes" className={labelCls}>
                          Special requests{" "}
                          <span className="text-gray-600 font-normal">
                            (optional)
                          </span>
                        </label>
                        <textarea
                          id="notes"
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className={`${fieldCls} resize-none`}
                          placeholder="Any specific colors or tweaks?"
                        />
                      </div>
                    </section>
                  </>
                )}
              </div>

              {/* Footer: selection screen */}
              {showSelectionScreen &&
                !loadingServices &&
                services.length > 0 && (
                  <div className="p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-[#1A1A1A]">
                    <button
                      onClick={() => {
                        if (selectedServices.length === 0)
                          return showValidationError(
                            "Please select at least one service.",
                          );
                        setBookingScreen("Form");
                      }}
                      className={`w-full py-3.5 text-sm ${btnPrimary}`}
                    >
                      {selectedServices.length > 0
                        ? `Continue with ${selectedServices.length} selected`
                        : "Continue"}
                    </button>
                  </div>
                )}

              {/* Footer: form screen */}
              {showFormScreen && (
                <div className="p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-[#1A1A1A] animate-in slide-in-from-bottom-2 duration-300">
                  {slotText && (
                    <p className="text-sm text-white font-semibold text-center mb-3">
                      {slotText}
                    </p>
                  )}
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting}
                    className={`w-full py-3.5 text-sm ${btnPrimary}`}
                  >
                    {isSubmitting ? "Submitting…" : "Submit booking"}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-3">
                    We'll confirm your appointment and final pricing by DM or
                    email.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </Portal>
      )}

      {/* DETAILS MODAL */}
      {isDetailsVisible && (
        <Portal>
          <div
            {...scrollGuard}
            role="dialog"
            aria-modal="true"
            aria-label={selectedNail?.title ?? "Design details"}
            className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center sm:p-4 lg:p-6"
          >
            <div
              className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${selectedNail ? "opacity-100" : "opacity-0"}`}
              onClick={() => setSelectedNail(null)}
            />
            <div
              className={`relative w-full sm:max-w-xl md:max-w-4xl xl:max-w-5xl max-h-[92dvh] bg-[#0A0A0A] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 ease-out motion-reduce:transition-none ${selectedNail ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
            >
              <button
                onClick={() => setSelectedNail(null)}
                aria-label="Close details"
                className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 bg-black/60 text-gray-300 hover:text-white rounded-full backdrop-blur-md ${ring}`}
              >
                <Icon name="close" />
              </button>

              <div className="w-full md:w-1/2 h-56 sm:h-72 md:h-auto shrink-0 bg-[#1A1A1A]">
                <img
                  src={selectedNail?.img}
                  alt={selectedNail?.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full md:w-1/2 flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 lg:p-8 flex flex-col">
                <h2 className="cormorant-garamond-header text-2xl sm:text-3xl xl:text-4xl font-bold text-white mb-3">
                  {selectedNail?.title}
                </h2>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6 max-w-prose">
                  {selectedNail?.description}
                </p>

                <div className="space-y-5 mb-6">
                  <ChipGroup
                    label="Shape"
                    items={selectedNail ? [selectedNail.shape] : []}
                  />
                  <ChipGroup label="Colors" items={selectedNail?.colors} />
                  <ChipGroup label="Designs" items={selectedNail?.designs} />
                </div>

                <button
                  onClick={() => {
                    const nail = selectedNail;
                    setSelectedNail(null);
                    if (nail) handleBookDesign(nail);
                  }}
                  className={`mt-auto w-full py-3.5 text-sm shadow-[0_0_20px_rgba(255,0,127,0.3)] ${btnPrimary}`}
                >
                  Book this look
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* PAGE HEADER */}
      <header className="flex flex-col items-center text-center mb-8 sm:mb-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#FF007F]/30 bg-[#FF007F]/10 px-3 py-1 text-xs sm:text-sm font-semibold text-[#FF007F]">
          <Icon name="sparkles" size={14} />
          Nail design gallery
        </span>
        <h1 className="cormorant-garamond-header text-white font-medium text-3xl sm:text-4xl lg:text-5xl pt-4 pb-3">
          The Glossx.Claw Collections
        </h1>
        <p className="leading-snug inter-subcaption text-[#F9FAFB]/60 text-sm sm:text-base max-w-xl lg:max-w-2xl">
          Explore our latest handcrafted sets. Tap a look to see its details, or
          book it straight away.
        </p>
      </header>

      {/* FILTER BAR */}
      <section
        aria-label="Filter designs"
        className="w-full bg-white/[0.02] border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl mb-8 sm:mb-12"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-white font-bold text-base sm:text-lg">
              Filter designs
            </h2>
            <p
              className="text-xs sm:text-sm text-gray-400 mt-0.5"
              aria-live="polite"
            >
              {selectedFilters.length > 0
                ? `${filteredImages.length} ${filteredImages.length === 1 ? "look matches" : "looks match"} your filters`
                : "Narrow down by shape, color, or style"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedFilters.length > 0 && (
              <button
                onClick={() => setSelectedFilters([])}
                className={`px-3 py-2 text-sm font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all ${ring}`}
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className={`sm:hidden inline-flex items-center gap-2 px-3 py-2 text-sm ${btnGhost} rounded-lg`}
            >
              <Icon name="sliders" size={16} />
              Filters
              {selectedFilters.length > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#FF007F] px-1 text-xs font-bold">
                  {selectedFilters.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {selectedFilters.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-4">
            {selectedFilters.map((filter) => (
              <li
                key={filter}
                className="flex items-center gap-1 bg-[#FF007F]/15 border border-[#FF007F]/30 text-[#FF007F] pl-3 pr-1 py-1 rounded-full text-xs sm:text-sm font-semibold"
              >
                {filter}
                <button
                  onClick={() => toggleFilter(filter)}
                  aria-label={`Remove filter ${filter}`}
                  className={`grid h-6 w-6 place-items-center rounded-full hover:bg-[#FF007F] hover:text-white transition-colors ${ring}`}
                >
                  <Icon name="close" size={12} strokeWidth={2.5} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div
          className={`${showFilters ? "grid" : "hidden"} sm:grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mt-4 sm:mt-6`}
        >
          <SearchableDropdown
            title="Shape"
            options={allShapes}
            selected={selectedFilters}
            onToggle={toggleFilter}
          />
          <SearchableDropdown
            title="Color"
            options={allColors}
            selected={selectedFilters}
            onToggle={toggleFilter}
          />
          <SearchableDropdown
            title="Design"
            options={allDesigns}
            selected={selectedFilters}
            onToggle={toggleFilter}
          />
        </div>
      </section>

      {/* GALLERY GRID / LOADING / ERROR / EMPTY */}
      {loadingDesigns ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          aria-busy="true"
          aria-label="Loading designs"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-2xl bg-[#1A1A1A] border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : designsError ? (
        <div
          role="alert"
          className="max-w-md mx-auto py-12 sm:py-16 text-center px-4"
        >
          <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
            <Icon name="alert" size={28} />
          </div>
          <h3 className="text-white text-lg sm:text-xl font-bold mb-1">
            We couldn't load the designs
          </h3>
          <p className="text-gray-400 text-sm mb-5">{designsError}</p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className={`px-6 py-3 text-sm ${btnPrimary}`}
          >
            Try again
          </button>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-12 sm:py-20 px-4">
          <div className="w-14 h-14 rounded-full bg-[#FF007F]/10 text-[#FF007F] flex items-center justify-center mx-auto mb-4">
            <Icon name="search" size={26} />
          </div>
          <h3 className="text-white text-xl sm:text-2xl font-bold mb-1">
            No designs found
          </h3>
          <p className="text-gray-400 text-sm sm:text-base mb-5">
            Try removing a filter to see more looks.
          </p>
          {selectedFilters.length > 0 && (
            <button
              onClick={() => setSelectedFilters([])}
              className={`px-6 py-3 text-sm ${btnGhost}`}
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div
          ref={gridRef}
          className="nails-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          {visibleImages.map((image) => (
            <NailsCard
              key={image.id}
              img={image.img}
              title={image.title}
              description={image.description}
              shape={image.shape}
              colors={image.colors}
              designs={image.designs}
              onClick={() => setSelectedNail(image)}
              onBookClick={() => handleBookDesign(image)}
            />
          ))}
        </div>
      )}

      {/* LOAD MORE */}
      {!loadingDesigns && filteredImages.length > 0 && (
        <div className="flex flex-col items-center gap-3 mt-8 sm:mt-10">
          <p className="text-xs sm:text-sm text-gray-500">
            Showing {visibleImages.length} of {filteredImages.length} looks
          </p>
          {visibleCount < filteredImages.length && (
            <button
              onClick={() => setVisibleCount(visibleCount + 8)}
              className={`w-full sm:w-auto px-8 py-3.5 text-sm rounded-full ${btnPrimary}`}
            >
              Load more looks
            </button>
          )}
        </div>
      )}

      {/* CUSTOM DESIGN BANNER */}
      <section className="relative overflow-hidden mt-12 sm:mt-16 border border-white/10 bg-[#1A1A1A] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 gloss-border shadow-dark-card">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FF007F]/15 blur-3xl"
        />
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left max-w-2xl">
            <h3 className="text-xl sm:text-2xl xl:text-3xl font-serif font-bold text-white">
              Have a Pinterest board or photo reference?
            </h3>
            <p className="text-sm sm:text-base text-gray-400">
              Send your reference to us on social, or choose the custom set in
              the booking portal and upload it there.
            </p>
          </div>
          <button
            onClick={() => {
              const customService = services.find((s) => s.slug === "custom");
              if (customService) requestCustom(customService);
              else showValidationError("Custom service not found.");
            }}
            className={`w-full lg:w-auto lg:whitespace-nowrap px-8 py-4 text-sm rounded-full shadow-[0_0_30px_rgba(255,0,127,0.4)] hover:shadow-[0_0_50px_rgba(255,0,127,0.5)] ${btnPrimary}`}
          >
            Book a custom set
          </button>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Searchable Dropdown
// ─────────────────────────────────────────────────────────────────────────────

function SearchableDropdown({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const panelId = `dropdown-${title.toLowerCase()}`;

  const close = () => {
    setIsOpen(false);
    setSearchTerm("");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const selectedInThisDropdown = selected.filter((item) =>
    options.includes(item),
  );

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) {
          e.stopPropagation();
          close();
        }
      }}
    >
      <label
        htmlFor={`${panelId}-trigger`}
        className="block text-sm font-semibold text-gray-300 mb-2"
      >
        {title}
      </label>
      <button
        id={`${panelId}-trigger`}
        type="button"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`w-full flex items-center justify-between gap-2 bg-black/50 border text-white text-sm rounded-xl px-4 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF007F]/40 ${
          isOpen || selectedInThisDropdown.length > 0
            ? "border-[#FF007F]/60"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <span
          className={`truncate text-left ${selectedInThisDropdown.length === 0 ? "text-gray-500" : ""}`}
        >
          {selectedInThisDropdown.length > 0
            ? selectedInThisDropdown.join(", ")
            : `Any ${title.toLowerCase()}`}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {selectedInThisDropdown.length > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#FF007F] px-1 text-xs font-bold">
              {selectedInThisDropdown.length}
            </span>
          )}
          <Icon
            name="chevron"
            size={16}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {isOpen && (
        <div
          id={panelId}
          className="absolute z-50 w-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <Icon
                name="search"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                autoFocus
                placeholder={`Search ${title.toLowerCase()}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF007F]"
              />
            </div>
          </div>
          <div className="max-h-56 sm:max-h-60 overflow-y-auto p-2 flex flex-col gap-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const checked = selected.includes(option);
                return (
                  <label
                    key={option}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      checked ? "bg-[#FF007F]/10" : "hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(option)}
                      className="accent-[#FF007F] w-4 h-4 shrink-0"
                    />
                    <span
                      className={`text-sm ${checked ? "text-white font-semibold" : "text-gray-300"}`}
                    >
                      {option}
                    </span>
                  </label>
                );
              })
            ) : (
              <div className="text-center text-gray-500 text-sm py-6">
                No matches
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
