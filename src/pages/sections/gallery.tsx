import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import NailsCard from "../../components/nails-card";
import { useAuth } from "../../context/authContext";
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

// Custom Hook for exit animations
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

export default function Gallery({
  bookingIntent,
  onIntentHandled,
  onScrollToGallery,
}: GalleryProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Gallery Data States
  const [images, setImages] = useState<NailData[]>([]);
  const [pendingDesignChange, setPendingDesignChange] =
    useState<NailData | null>(null);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [designsError, setDesignsError] = useState<string | null>(null);

  // Services Data States
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Filter States
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);

  // Modal States
  const [selectedNail, setSelectedNail] = useState<NailData | null>(null);

  // Booking flow state
  const [bookingScreen, setBookingScreen] = useState<BookingScreen>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<NailData | null>(null);
  const [pendingServices, setPendingServices] = useState<Service[]>([]);
  // When true the slide-over is hidden but the draft (design/date/notes) is kept,
  // so the user can browse the gallery and pick a different design.
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  // Custom service the user wants to switch to, waiting for confirmation
  const [pendingCustomService, setPendingCustomService] =
    useState<Service | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Booking Form States
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [customImage, setCustomImage] = useState<File | null>(null);

  // Availability & Submit States
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBookingOpen =
    !isPanelMinimized && (bookingScreen !== null || selectedDesign !== null);

  // Anything worth keeping if the user closes the panel
  const hasTypedData = !!(selectedDate || selectedTime || notes || customImage);
  const hasDraft =
    selectedDesign !== null || selectedServices.length > 0 || hasTypedData;
  const hasCustomSelected = selectedServices.some((s) => s.slug === "custom");
  const isDetailsVisible = useModalAnimation(!!selectedNail);
  const isBookingVisible = useModalAnimation(isBookingOpen);

  const gridRef = useRef<HTMLDivElement>(null);

  const availableTimes = [
    "10:00 AM",
    "11:00 AM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ];

  // ── Fetch Services & Designs on Mount ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
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
  }, []);

  // Re-fetch gallery when user switches back to the browser tab
  useEffect(() => {
    const handleFocus = () => {
      if (!loadingDesigns) {
        listDesigns({ includeInactive: false, pageSize: 100 })
          .then(({ data }) => setImages(data.map(mapDesign)))
          .catch(() => {
            /* keep the current list if the refresh fails */
          });
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadingDesigns]);

  // ── Design selection helpers ──────────────────────────────────────────────

  // Adds the "gallery-selection" service (and its parent, e.g. Bespoke) if missing
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

  // A collection design and a custom set are mutually exclusive:
  // picking a design drops the custom service (and its uploaded photo).
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
    // A different design (or a custom set) is already chosen -> confirm first
    if (
      (selectedDesign && selectedDesign.id !== newDesign.id) ||
      (!selectedDesign && hasCustomSelected)
    ) {
      setPendingDesignChange(newDesign);
      return;
    }
    // Otherwise select it (or just resume the panel if it's the same design)
    applyDesign(newDesign);
  };

  // Choosing the custom set always asks for confirmation first
  const requestCustom = (customService: Service) => {
    if (hasCustomSelected) {
      // already chosen -> just resume the form
      setBookingScreen("Form");
      setIsPanelMinimized(false);
      return;
    }
    setPendingCustomService(customService);
  };

  // Confirmed: custom replaces any chosen design / gallery selection
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

  // Every way of closing the booking (X, backdrop, Escape) asks first,
  // as long as there is something to lose.
  const handleCloseAttempt = () => {
    // closing the confirmation itself = keep editing
    if (showCancelConfirm) {
      setShowCancelConfirm(false);
      return;
    }
    if (hasDraft) setShowCancelConfirm(true);
    else resetBooking();
  };

  // The x on the "Booking in progress" bar: reopen the panel on the confirmation
  const handleDiscardDraft = () => {
    if (hasDraft) {
      setIsPanelMinimized(false);
      setShowCancelConfirm(true);
    } else {
      resetBooking();
    }
  };

  // Escape key closes the booking (through the same confirmation)
  useEffect(() => {
    if (!isBookingOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // don't close the panel behind another open modal
      if (pendingDesignChange || pendingCustomService) return;
      handleCloseAttempt();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // Toggle service in the multi-select combo
  const toggleService = (service: Service) => {
    const isRemoving = selectedServices.some((s) => s.id === service.id);
    const children = services.filter((c) => c.parent_id === service.id);

    if (isRemoving) {
      // unchecking a parent (e.g. Bespoke) also clears what was chosen under it
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
    if (!user) {
      resetBooking();
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate("/login");
      }, 2500);
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert("Please select both a date and a time.");
      return;
    }

    if (selectedServices.length === 0) {
      alert("Please select at least one service.");
      return;
    }

    setIsSubmitting(true);
    let uploadedImageUrl: string | null = null;

    try {
      // 1. Upload custom image if the 'custom' service was selected
      const wantsCustomImage = selectedServices.some(
        (s) => s.slug === "custom",
      );
      if (wantsCustomImage && customImage) {
        const ext = customImage.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

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

      // 2. Create the main Booking record
      const { data: booking, error: dbError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          date: selectedDate,
          time: selectedTime,
          notes: notes,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Create the Booking Services junction records
      const bookingServicesData = selectedServices.map((service) => ({
        booking_id: booking.id,
        service_id: service.id,
        // Apply design only to the gallery selection service
        design_id:
          service.slug === "gallery-selection"
            ? selectedDesign?.id || null
            : null,
        // Apply custom image only to the custom service
        custom_image_url: service.slug === "custom" ? uploadedImageUrl : null,
      }));

      const { error: junctionError } = await supabase
        .from("booking_services")
        .insert(bookingServicesData);

      if (junctionError) throw junctionError;

      alert("Booking request submitted! We will review and confirm shortly.");
      resetBooking();
    } catch (error: any) {
      alert("Error booking: " + error.message);
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
      if (cardsToAnimate.length > 0) {
        gsap.to(cardsToAnimate, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
          onComplete: () =>
            cardsToAnimate.forEach((card) =>
              card.classList.remove("opacity-0"),
            ),
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [visibleCount, selectedFilters, loadingDesigns]);

  // ── Derived Values for UI ─────────────────────────────────────────────────
  const needsCustomImage = selectedServices.some((s) => s.slug === "custom");

  const bookingHeaderTitle =
    selectedServices.length > 1
      ? "Combo Booking"
      : selectedServices.length === 1
        ? selectedServices[0].name
        : "New Booking";

  const isFormScreen =
    bookingScreen === "Form" ||
    selectedDesign !== null ||
    selectedServices.length > 0;

  return (
    <div className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-10 xl:px-16 max-w-[1600px] mx-auto relative">
      {/* --- FLOATING GALLERY BANNER (Shows when user is browsing designs) --- */}
      {pendingServices.length > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[9990] w-[calc(100vw-2rem)] sm:w-auto sm:max-w-[90vw] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#1A1A1A] border border-[#FF007F]/50 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl sm:rounded-full shadow-[0_0_40px_rgba(255,0,127,0.3)] flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 rounded-full bg-[#FF007F]/20 flex items-center justify-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF007F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold leading-snug">
                Selecting a design for your booking
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400 leading-snug">
                {pendingServices.map((s) => s.name).join(" + ")} — Click "Book
                This Look" below.
              </p>
            </div>
            <button
              onClick={() => setPendingServices([])}
              className="shrink-0 sm:ml-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              title="Cancel Selection"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* --- BOOKING IN PROGRESS BAR (panel minimized while browsing) --- */}
      {isPanelMinimized && hasDraft && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9990] w-[calc(100vw-2rem)] sm:w-auto sm:max-w-[90vw] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-[#1A1A1A] border border-[#FF007F]/50 text-white pl-2.5 pr-2.5 sm:pl-3 sm:pr-4 py-2.5 sm:py-3 rounded-2xl sm:rounded-full shadow-[0_0_40px_rgba(255,0,127,0.3)] flex items-center gap-2 sm:gap-3">
            {selectedDesign && (
              <img
                src={selectedDesign.img}
                alt=""
                className="w-9 h-11 sm:w-10 sm:h-12 object-cover rounded-md shrink-0"
              />
            )}
            <div className="min-w-0 flex-1 sm:flex-none">
              <p className="text-xs sm:text-sm font-bold">Booking in progress</p>
              <p className="text-[11px] sm:text-xs text-gray-400 truncate sm:max-w-[220px] xl:max-w-xs">
                {selectedDesign
                  ? selectedDesign.title
                  : selectedServices.map((s) => s.name).join(" + ") ||
                    "Your booking"}
              </p>
            </div>
            <button
              onClick={() => setIsPanelMinimized(false)}
              className="shrink-0 px-3 sm:px-4 py-2 rounded-full bg-[#FF007F] text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:bg-[#ff1a8c] transition-colors"
            >
              Resume
            </button>
            <button
              onClick={handleDiscardDraft}
              className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              title="Discard booking"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* --- TOAST NOTIFICATION --- */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] w-[calc(100vw-2rem)] sm:w-auto max-w-sm animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-[#1A1A1A] border border-red-500/30 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm">Login Required</p>
              <p className="text-xs xl:text-sm text-gray-400">
                Please log in to book an appointment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- CHANGE DESIGN CONFIRMATION MODAL (page level, above everything) --- */}
      {pendingDesignChange && (selectedDesign || hasCustomSelected) && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setPendingDesignChange(null)}
          />
          <div className="relative w-full max-w-sm sm:max-w-md xl:max-w-lg max-h-[92dvh] overflow-y-auto bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 sm:p-6 xl:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#FF007F]/10 flex items-center justify-center text-[#FF007F] mb-3 sm:mb-4 mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 sm:w-8 sm:h-8"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 text-center">
              Change Selected Design?
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 text-center">
              {selectedDesign ? (
                <>
                  You already picked{" "}
                  <strong className="text-white">
                    "{selectedDesign.title}"
                  </strong>
                  . Switch to{" "}
                  <strong className="text-white">
                    "{pendingDesignChange.title}"
                  </strong>
                  ?
                </>
              ) : (
                <>
                  You chose the{" "}
                  <strong className="text-white">Custom Nail Set</strong>.
                  Picking{" "}
                  <strong className="text-white">
                    "{pendingDesignChange.title}"
                  </strong>{" "}
                  will remove it
                  {customImage ? " and your uploaded photo" : ""}. Continue?
                </>
              )}
            </p>

            <div className="flex items-center gap-3 sm:gap-4 bg-white/5 p-3 rounded-xl border border-white/10 mb-4 sm:mb-6">
              <img
                src={pendingDesignChange.img}
                alt="New design"
                className="w-14 h-[4.5rem] sm:w-16 sm:h-20 object-cover rounded-lg shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[10px] text-[#FF007F] font-bold uppercase tracking-widest">
                  New Selection
                </p>
                <p className="text-white font-bold text-sm sm:text-base">
                  {pendingDesignChange.title}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setPendingDesignChange(null)}
                className="flex-1 py-2.5 sm:py-3 text-sm rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
              >
                Keep Current
              </button>
              <button
                onClick={() => {
                  const next = pendingDesignChange;
                  setPendingDesignChange(null);
                  if (next) applyDesign(next);
                }}
                className="flex-1 py-2.5 sm:py-3 text-sm rounded-xl bg-[#FF007F] text-white font-bold hover:bg-[#ff1a8c] transition-all"
              >
                Yes, Change It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM SET CONFIRMATION MODAL (page level, above everything) --- */}
      {pendingCustomService && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setPendingCustomService(null)}
          />
          <div className="relative w-full max-w-sm sm:max-w-md xl:max-w-lg max-h-[92dvh] overflow-y-auto bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 sm:p-6 xl:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#FF007F]/10 flex items-center justify-center text-[#FF007F] mb-3 sm:mb-4 mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 sm:w-8 sm:h-8"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 text-center">
              Book a Custom Nail Set?
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 text-center">
              {selectedDesign ? (
                <>
                  Choosing a custom set will remove your selected design{" "}
                  <strong className="text-white">
                    "{selectedDesign.title}"
                  </strong>
                  . You'll upload your inspiration photo on the next step.
                </>
              ) : (
                <>
                  You'll upload your inspiration photo or Pinterest reference
                  on the next step so we can recreate it for you.
                </>
              )}
            </p>

            {selectedDesign && (
              <div className="flex items-center gap-3 sm:gap-4 bg-white/5 p-3 rounded-xl border border-white/10 mb-4 sm:mb-6">
                <img
                  src={selectedDesign.img}
                  alt="Design to be removed"
                  className="w-14 h-[4.5rem] sm:w-16 sm:h-20 object-cover rounded-lg shrink-0 opacity-70"
                />
                <div className="min-w-0">
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
                    Will be removed
                  </p>
                  <p className="text-white font-bold text-sm sm:text-base">
                    {selectedDesign.title}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setPendingCustomService(null)}
                className="flex-1 py-2.5 sm:py-3 text-sm rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const next = pendingCustomService;
                  setPendingCustomService(null);
                  if (next) applyCustom(next);
                }}
                className="flex-1 py-2.5 sm:py-3 text-sm rounded-xl bg-[#FF007F] text-white font-bold hover:bg-[#ff1a8c] transition-all"
              >
                Yes, Go Custom
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BOOKING SLIDE-OVER MODAL --- */}
      {isBookingVisible && (
        <div className="fixed inset-0 z-[9999] flex justify-end overflow-hidden">
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isBookingOpen ? "opacity-100" : "opacity-0"}`}
            onClick={handleCloseAttempt}
          />

          <div
            className={`relative w-full sm:max-w-md lg:max-w-lg xl:max-w-xl bg-[#0A0A0A] h-full shadow-2xl border-l border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${isBookingOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-white/10 bg-[#1A1A1A]">
              <h2 className="text-lg sm:text-xl xl:text-2xl font-bold text-white playfair-display-header truncate">
                {bookingHeaderTitle}
              </h2>
              <button
                onClick={handleCloseAttempt}
                className="shrink-0 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" x2="6" y1="6" y2="18" />
                  <line x1="6" x2="18" y1="6" y2="18" />
                </svg>
              </button>
            </div>

            {/* CANCELLATION CONFIRMATION OVERLAY */}
            {showCancelConfirm ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-7 h-7 sm:w-8 sm:h-8"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  Discard Booking?
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-6">
                  Are you sure you want to cancel? Your selected services,
                  design, date, time, and notes will be lost.
                </p>
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-2.5 sm:py-3 text-sm rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={resetBooking}
                    className="flex-1 py-2.5 sm:py-3 text-sm rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
                  >
                    Yes, Discard
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setIsPanelMinimized(true);
                  }}
                  className="mt-4 text-xs text-[#FF007F] hover:text-white transition-colors"
                >
                  Minimize and keep browsing designs
                </button>
              </div>
            ) : (
              <>
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 xl:p-8 space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* 1. MAIN SELECTION SCREEN (Multi-Select) */}
                  {bookingScreen === "Selection" && (
                    <div className="flex flex-col gap-3 sm:gap-4 py-2">
                      <p className="text-gray-400 text-xs sm:text-sm text-center mb-2 sm:mb-4">
                        Select the services you want to book together.
                      </p>

                      {loadingServices ? (
                        <div className="text-center text-gray-500 py-10 animate-pulse">
                          Loading services...
                        </div>
                      ) : services.length === 0 ? (
                        <div className="text-center text-red-400 py-10">
                          No services found in database.
                        </div>
                      ) : (
                        <>
                          {services
                            .filter((s) => !s.parent_id)
                            .map((service) => {
                              const isSelected = selectedServices.some(
                                (s) => s.id === service.id,
                              );
                              const hasChildren = services.some(
                                (c) => c.parent_id === service.id,
                              );

                              return (
                                <div
                                  key={service.id}
                                  className={`border rounded-2xl transition-all ${isSelected ? "border-[#FF007F] bg-[#FF007F]/5" : "border-white/10 bg-[#1A1A1A]"}`}
                                >
                                  <button
                                    onClick={() => toggleService(service)}
                                    className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-6 text-left"
                                  >
                                    <div
                                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${isSelected ? "bg-[#FF007F] border-[#FF007F]" : "border-gray-500 border"}`}
                                    >
                                      {isSelected && (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="white"
                                          strokeWidth="3"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M20 6 9 17l-5-5" />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <h3 className="text-white font-bold text-base sm:text-lg">
                                        {service.name}
                                      </h3>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {service.description}
                                      </p>
                                    </div>
                                  </button>

                                  {/* Custom set chosen -> no need to choose a set */}
                                  {isSelected &&
                                    hasChildren &&
                                    hasCustomSelected && (
                                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t border-white/10 mt-2 flex items-center justify-between gap-3">
                                        <p className="text-xs sm:text-sm text-white">
                                          <span className="text-[#FF007F] font-bold">
                                            ✓
                                          </span>{" "}
                                          Custom Nail Set selected
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
                                          className="text-xs text-red-400 hover:text-red-300"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    )}

                                  {/* Sub-options for Bespoke */}
                                  {isSelected && hasChildren && !hasCustomSelected && (
                                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-white/10 mt-2">
                                      <p className="text-[#FF007F] text-xs font-bold uppercase tracking-wider mb-3">
                                        How would you like to choose your set?
                                      </p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        {services
                                          .filter(
                                            (c) => c.parent_id === service.id,
                                          )
                                          .map((child) => (
                                            <button
                                              key={child.id}
                                              onClick={(e) => {
                                                e.stopPropagation();

                                                if (
                                                  child.slug ===
                                                  "gallery-selection"
                                                ) {
                                                  // Save ALL currently selected services
                                                  // (e.g. Bespoke + Removal) plus the gallery
                                                  // selection they just clicked (no duplicates).
                                                  const servicesToSave = [
                                                    ...selectedServices,
                                                  ];
                                                  if (
                                                    !servicesToSave.some(
                                                      (s) => s.id === child.id,
                                                    )
                                                  ) {
                                                    servicesToSave.push(child);
                                                  }
                                                  setPendingServices(
                                                    servicesToSave,
                                                  );

                                                  // Close the modal
                                                  resetBooking();

                                                  // Scroll to gallery
                                                  if (onScrollToGallery)
                                                    setTimeout(
                                                      () => onScrollToGallery(),
                                                      150,
                                                    );
                                                } else {
                                                  // Custom Flow: ask for confirmation first
                                                  requestCustom(child);
                                                }
                                              }}
                                              className="py-3 px-3 rounded-xl border border-white/10 bg-black text-white text-sm font-semibold hover:border-[#FF007F]/50 hover:text-[#FF007F] transition-all"
                                            >
                                              {child.name}
                                            </button>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                          <button
                            onClick={() => {
                              if (selectedServices.length === 0)
                                return alert(
                                  "Please select at least one service.",
                                );
                              setBookingScreen("Form");
                            }}
                            className="mt-2 sm:mt-4 w-full py-3 sm:py-4 text-sm rounded-xl bg-[#FF007F] text-white font-bold uppercase tracking-wider hover:bg-[#ff1a8c] transition-all"
                          >
                            Continue to Form
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* 2. FORM SCREEN */}
                  {isFormScreen && bookingScreen === "Form" && (
                    <>
                      {/* Selected Services Summary */}
                      <div className="space-y-2 sm:space-y-3 bg-white/5 p-3 sm:p-4 rounded-2xl border border-white/10">
                        <span className="text-[#FF007F] text-xs font-bold uppercase tracking-widest">
                          Selected Services
                        </span>
                        {selectedServices.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between gap-2 text-xs sm:text-sm text-white"
                          >
                            <span>• {s.name}</span>
                            {s.slug === "gallery-selection" &&
                              selectedDesign && (
                                <span className="text-gray-400 text-right truncate max-w-[50%]">
                                  ({selectedDesign.title})
                                </span>
                              )}
                          </div>
                        ))}
                        {selectedDesign &&
                          selectedServices.some(
                            (s) => s.slug === "gallery-selection",
                          ) && (
                            <div className="flex gap-3 sm:gap-4 mt-2">
                              <img
                                src={selectedDesign.img}
                                alt="Selected"
                                className="w-14 h-[4.5rem] sm:w-16 sm:h-20 object-cover rounded-lg shrink-0"
                              />
                              <div className="flex flex-col justify-center min-w-0">
                                <span className="text-white font-bold text-sm sm:text-base">
                                  {selectedDesign.title}
                                </span>
                              </div>
                            </div>
                          )}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 pt-3 border-t border-white/10">
                          <button
                            onClick={removeSelection}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Clear All
                          </button>
                          {selectedDesign && (
                            <button
                              onClick={() => {
                                setIsPanelMinimized(true);
                                setTimeout(() => onScrollToGallery?.(), 150);
                              }}
                              className="text-xs text-[#FF007F] hover:text-white transition-colors"
                            >
                              Change design
                            </button>
                          )}
                          <button
                            onClick={() => setBookingScreen("Selection")}
                            className="text-xs text-[#FF007F] hover:text-white transition-colors"
                          >
                            + Add another service (e.g., Removal)
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/10">
                        <div>
                          <label className="block text-gray-400 text-xs sm:text-sm font-semibold mb-2">
                            Select Date
                          </label>
                          <BookingCalendar
                            onDateSelect={(date) => setSelectedDate(date)}
                            onTimeSelect={(time) => setSelectedTime(time)}
                            availableTimes={availableTimes}
                          />
                        </div>

                        {needsCustomImage && (
                          <div>
                            <label className="block text-gray-400 text-xs sm:text-sm font-semibold mb-2">
                              Upload Inspiration Photo (Required for Custom)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setCustomImage(
                                  e.target.files ? e.target.files[0] : null,
                                )
                              }
                              className="w-full text-sm bg-black border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white file:mr-3 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#FF007F]/20 file:text-[#FF007F] cursor-pointer"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-gray-400 text-xs sm:text-sm font-semibold mb-2">
                            Special Requests
                          </label>
                          <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full text-sm bg-black border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white focus:outline-none focus:border-[#FF007F] resize-none"
                            placeholder="Any specific colors or tweaks?"
                          ></textarea>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                {isFormScreen && bookingScreen === "Form" && (
                  <div className="p-4 sm:p-6 border-t border-white/10 bg-[#1A1A1A] animate-in slide-in-from-bottom-2 duration-300">
                    <button
                      onClick={handleConfirmBooking}
                      disabled={isSubmitting}
                      className="w-full bg-[#FF007F] text-white text-sm font-bold uppercase tracking-wider py-3 sm:py-4 rounded-xl hover:bg-[#ff1a8c] transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Processing..." : "Submit Booking"}
                    </button>
                    <p className="text-center text-[11px] sm:text-xs text-gray-500 mt-3">
                      We will confirm your appointment and final pricing via
                      DM/Email.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* --- DETAILS MODAL --- */}
      {isDetailsVisible && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-4 lg:p-6"
        >
          <div
            className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${selectedNail ? "opacity-100" : "opacity-0"}`}
            onClick={() => setSelectedNail(null)}
          />
          <div
            className={`relative w-full max-w-md sm:max-w-xl md:max-w-4xl xl:max-w-5xl max-h-[92dvh] bg-[#0A0A0A] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 ease-out ${selectedNail ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
          >
            <button
              onClick={() => setSelectedNail(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 bg-black/50 text-gray-400 hover:text-white rounded-full backdrop-blur-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </button>
            <div className="w-full md:w-1/2 h-48 sm:h-64 md:h-auto shrink-0 bg-[#1A1A1A]">
              <img
                src={selectedNail?.img}
                alt={selectedNail?.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 lg:p-8 flex flex-col">
              <span className="text-[#FF007F] text-xs font-bold uppercase tracking-widest mb-2">
                Design Details
              </span>
              <h2 className="cormorant-garamond-header text-2xl sm:text-3xl xl:text-4xl font-bold text-white mb-3 sm:mb-4">
                {selectedNail?.title}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-5 sm:mb-8">
                {selectedNail?.description}
              </p>

              <div className="space-y-4 mb-6 sm:mb-8">
                <div>
                  <span className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                    Shape
                  </span>
                  <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs sm:text-sm text-white">
                    {selectedNail?.shape}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                    Colors
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedNail?.colors.map((color, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs sm:text-sm text-white"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                    Designs
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedNail?.designs.map((design, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs sm:text-sm text-white"
                      >
                        {design}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const nail = selectedNail;
                  setSelectedNail(null);
                  if (nail) handleBookDesign(nail);
                }}
                className="mt-auto w-full bg-[#FF007F] text-white text-sm font-bold uppercase tracking-wider py-3 sm:py-4 rounded-xl hover:bg-[#ff1a8c] transition-all duration-300 shadow-[0_0_20px_rgba(255,0,127,0.3)]"
              >
                Book This Look
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-center mb-8 sm:mb-12">
        <span className="px-2 text-[#FF007F] flex items-center uppercase font-bold text-xs sm:text-sm lg:text-base">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-sparkles preview-icon mr-2"
          >
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
          </svg>
          Nail Designs Gallery
        </span>
        <h1 className="cormorant-garamond-header text-white font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl py-3 sm:py-4 text-center">
          The Glossx.Claw Collections
        </h1>
        <p className="leading-tight inter-subcaption text-[#F9FAFB]/60 text-sm sm:text-base text-center max-w-xl lg:max-w-2xl">
          Explore our latest handcrafted custom sets. Click any look to inspect
          the design specs or book it directly for your next appointment.
        </p>
      </div>

      {/* Filter UI */}
      <div className="w-full bg-transparent border border-white/10 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl mb-8 sm:mb-12 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg">
              Filter Designs
            </h3>
            <p
              className={`${selectedFilters.length > 0 ? "hidden" : "block"} text-[#F9FAFB]/60 text-xs sm:text-sm`}
            >
              Use filter to easily find your perfect look
            </p>
            {selectedFilters.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Showing {filteredImages.length} results for selected filters
              </p>
            )}
          </div>
          {selectedFilters.length > 0 && (
            <button
              onClick={() => setSelectedFilters([])}
              className="w-full md:w-auto px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
        {selectedFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            {selectedFilters.map((filter) => (
              <span
                key={filter}
                className="flex items-center gap-1 bg-[#FF007F]/20 text-[#FF007F] px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase"
              >
                {filter}
                <button
                  onClick={() => toggleFilter(filter)}
                  className="hover:text-white ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <SearchableDropdown
            title="Shapes"
            options={allShapes}
            selected={selectedFilters}
            onToggle={toggleFilter}
          />
          <SearchableDropdown
            title="Colors"
            options={allColors}
            selected={selectedFilters}
            onToggle={toggleFilter}
          />
          <SearchableDropdown
            title="Designs"
            options={allDesigns}
            selected={selectedFilters}
            onToggle={toggleFilter}
          />
        </div>
      </div>

      {/* Gallery Grid / Loading / Empty State */}
      {loadingDesigns ? (
        <div className="py-12 sm:py-20 text-center flex flex-col items-center justify-center text-gray-500">
          <svg
            className="animate-spin -ml-1 mr-3 h-8 w-8 text-[#FF007F] mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading designs...
        </div>
      ) : designsError ? (
        <div className="py-12 sm:py-20 text-center text-red-400 px-4">
          <p>Couldn't load designs: {designsError}</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-12 sm:py-20 px-4">
          <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">
            No designs found
          </h3>
          <p className="text-gray-400 text-sm sm:text-base">
            Try clearing some filters to see more results.
          </p>
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

      {visibleCount < filteredImages.length && (
        <div className="flex justify-center mt-8 sm:mt-10">
          <button
            onClick={() => setVisibleCount(visibleCount + 8)}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-[#FF007F] text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded-full hover:bg-[#ff1a8c] transition-all"
          >
            Load More Looks
          </button>
        </div>
      )}

      {/* Custom Design Banner */}
      <div className="mt-10 sm:mt-16 border border-white/20 bg-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 gloss-border flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6 shadow-dark-card">
        <div className="space-y-2 text-center lg:text-left">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#FF007F]">
            Custom Design Request
          </span>
          <h3 className="text-xl sm:text-2xl xl:text-3xl font-serif font-bold text-white">
            Have a Pinterest board or photo reference?
          </h3>
          <p className="text-xs sm:text-sm text-gray-400">
            Send your photo reference on our social DMs or select custom set in
            our booking portal.
          </p>
        </div>
        <button
          onClick={() => {
            const customService = services.find((s) => s.slug === "custom");
            if (customService) {
              requestCustom(customService);
            } else {
              alert("Custom service not found.");
            }
          }}
          className="w-full sm:w-auto sm:whitespace-nowrap px-6 sm:px-8 py-3 sm:py-4 bg-[#FF007F] hover:bg-[#FF007F]/90 text-white font-extrabold text-xs uppercase tracking-widest rounded-full cursor-pointer shadow-[0_0_30px_rgba(255,0,127,0.4)] hover:shadow-[0_0_60px_rgba(255,0,127,0.4)] transition-all"
        >
          Book Custom Inspo Set
        </button>
      </div>
    </div>
  );
}

// Searchable Dropdown Component
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
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
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[#FF007F] text-xs font-bold uppercase tracking-widest mb-2">
        {title}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-black/50 border border-white/10 text-white text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-[#FF007F] transition-colors"
      >
        <span className="truncate pr-2">
          {selectedInThisDropdown.length > 0
            ? selectedInThisDropdown.join(", ")
            : `Select ${title}...`}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <input
              type="text"
              placeholder={`Search ${title}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF007F]"
            />
          </div>
          <div className="max-h-52 sm:max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => onToggle(option)}
                    className="accent-[#FF007F] w-4 h-4 shrink-0"
                  />
                  <span className="text-sm text-gray-300">{option}</span>
                </label>
              ))
            ) : (
              <div className="text-center text-gray-500 text-sm py-4">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}