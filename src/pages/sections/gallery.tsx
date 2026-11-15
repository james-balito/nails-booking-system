import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import NailsCard from "../../components/nails-card";
import { nailsImages as images } from "../../assets/nails";
import { useAuth } from "../../context/authContext";
import BookingCalendar from "../../components/booking-calendar";
import supabase from "../../config/supabaseClient";

interface NailData {
  id: number;
  img: string;
  title: string;
  description: string;
  shape: string;
  colors: string[];
  designs: string[];
}

export type BookingIntent = {
  target: "Selection" | "BespokeSelection" | "Removal" | "Custom";
  serviceName?: string; // chosen service label from Services
  nonce: number; // ensures repeated clicks re-fire
};

interface GalleryProps {
  bookingIntent?: BookingIntent | null;
  onIntentHandled?: () => void;
  onScrollToGallery?: () => void;
}

// Booking flow is now three separate pieces of state:
// - bookingScreen: which screen/modal is showing (or null)
// - selectedDesign: the design payload when a specific look is being booked
// - selectedService: the service label shown in the banner
type BookingScreen = "Selection" | "BespokeSelection" | "Removal" | "Custom" | null;

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

export default function Gallery({
  bookingIntent,
  onIntentHandled,
  onScrollToGallery,
}: GalleryProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Filter States
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);

  // Modal States
  const [selectedNail, setSelectedNail] = useState<NailData | null>(null);

  // Booking flow state — split by concern
  const [bookingScreen, setBookingScreen] = useState<BookingScreen>(null);
  const [selectedDesign, setSelectedDesign] = useState<NailData | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Booking Form States
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [customImage, setCustomImage] = useState<File | null>(null);

  // Availability & Submit States
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBookingOpen = bookingScreen !== null || selectedDesign !== null;
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

  // Extract Unique Filters
  const allShapes = useMemo(
    () => Array.from(new Set(images.map((img) => img.shape))),
    []
  );
  const allColors = useMemo(
    () => Array.from(new Set(images.flatMap((img) => img.colors))),
    []
  );
  const allDesigns = useMemo(
    () => Array.from(new Set(images.flatMap((img) => img.designs))),
    []
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
      })
    );
  }, [selectedFilters]);

  const visibleImages = filteredImages.slice(0, visibleCount);

  const toggleFilter = (value: string) => {
    setSelectedFilters((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
    setVisibleCount(12);
  };

  // Reset everything
  const resetBooking = () => {
    setBookingScreen(null);
    setSelectedDesign(null);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setNotes("");
    setCustomImage(null);
    setShowCancelConfirm(false);
  };

  // Go back to main menu
  const removeSelection = () => {
    setBookingScreen("Selection");
    setSelectedDesign(null);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setNotes("");
    setCustomImage(null);
  };

  // Handle external booking intents (Navbar, Home, Services, Testimonials)
  useEffect(() => {
    if (!bookingIntent) return;

    setSelectedDesign(null);
    setBookingScreen(bookingIntent.target);
    setSelectedService(bookingIntent.serviceName ?? null);
    setShowCancelConfirm(false);

    // Acknowledge so the same nonce isn't replayed on re-render
    onIntentHandled?.();
  }, [bookingIntent, onIntentHandled]);

  // Open booking for a specific design or fixed screen
  const handleOpenBooking = (nail: NailData | "Custom" | "Removal") => {
    if (typeof nail === "string") {
      setSelectedDesign(null);
      setBookingScreen(nail);
      setSelectedService(
        nail === "Removal"
          ? "Nail Removal"
          : nail === "Custom"
          ? "Custom Nail Set"
          : null
      );
    } else {
      setSelectedDesign(nail);
      setBookingScreen(null);
      setSelectedService("Nail Art Designs");
    }
    setShowCancelConfirm(false);
  };

  // Handle Close Attempt
  const handleCloseAttempt = () => {
    if (selectedDate || selectedTime || notes || customImage) {
      setShowCancelConfirm(true);
    } else {
      resetBooking();
    }
  };

  // Handle Submit
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

    setIsSubmitting(true);
    let uploadedImageUrl: string | null = null;

    try {
      if (bookingScreen === "Custom" && customImage) {
        const fileExt = customImage.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("custom-inspirations")
          .upload(fileName, customImage);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("custom-inspirations").getPublicUrl(fileName);

        uploadedImageUrl = publicUrl;
      }

      // design_id is only set when a specific design was chosen
      const designId = selectedDesign ? selectedDesign.id : null;

      const { error: dbError } = await supabase.from("bookings").insert({
        date: selectedDate,
        time: selectedTime,
        notes: notes,
        design_id: designId,
        custom_image_url: uploadedImageUrl,
        status: "pending",
      });

      if (dbError) throw dbError;

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
      if (!gridRef.current) return;
      const cardsToAnimate =
        gridRef.current.querySelectorAll(".nails-card.opacity-0");
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
              card.classList.remove("opacity-0")
            ),
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [visibleCount, selectedFilters]);

  // Derive the header title from current state
  const bookingHeaderTitle = selectedDesign
    ? `Book ${selectedDesign.title}`
    : selectedService
    ? selectedService
    : bookingScreen === "Selection"
    ? "New Booking"
    : bookingScreen === "BespokeSelection"
    ? "Bespoke Nails"
    : bookingScreen === "Removal"
    ? "Nail Removal"
    : bookingScreen === "Custom"
    ? "Custom Set"
    : "";

  // Derive whether the details form is showing (everything except Selection/BespokeSelection)
  const isFormScreen =
    selectedDesign !== null ||
    (bookingScreen !== null &&
      bookingScreen !== "Selection" &&
      bookingScreen !== "BespokeSelection");

  const isCustomScreen = bookingScreen === "Custom";
  const isRemovalScreen = bookingScreen === "Removal";

  return (
    <div className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 xl:px-16 max-w-[1600px] mx-auto relative">
      {/* --- TOAST NOTIFICATION --- */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-[#1A1A1A] border border-red-500/30 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
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
            <div>
              <p className="font-bold text-sm">Login Required</p>
              <p className="text-xs xl:text-sm text-gray-400">
                Please log in to book an appointment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- BOOKING SLIDE-OVER MODAL --- */}
      {isBookingVisible && (
        <div className="fixed inset-0 z-[9999] flex justify-end overflow-hidden">
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              isBookingOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleCloseAttempt}
          />

          <div
            className={`relative w-full max-w-md bg-[#0A0A0A] h-full shadow-2xl border-l border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
              isBookingOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1A1A1A]">
              <h2 className="text-xl font-bold text-white playfair-display-header">
                {bookingHeaderTitle}
              </h2>
              <button
                onClick={handleCloseAttempt}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
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
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
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
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Discard Booking?
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Are you sure you want to cancel? Your selected date, time, and
                  notes will be lost.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={resetBooking}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
                  >
                    Yes, Discard
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Scrollable Content */}
                <div
                  key={
                    bookingScreen === "Selection"
                      ? "selection"
                      : bookingScreen === "BespokeSelection"
                      ? "bespoke"
                      : "form"
                  }
                  className="flex-1 overflow-y-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  {/* 1. MAIN SELECTION SCREEN */}
                  {bookingScreen === "Selection" && (
                    <div className="flex flex-col gap-4 py-8">
                      <p className="text-gray-400 text-sm text-center mb-4">
                        What service are you booking?
                      </p>

                      <button
                        onClick={() => setBookingScreen("BespokeSelection")}
                        className="flex flex-col items-center p-6 bg-[#1A1A1A] border border-white/10 rounded-2xl hover:border-[#FF007F]/50 transition-all group"
                      >
                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#FF007F] mb-3 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                        <h3 className="text-white font-bold text-lg">
                          Bespoke Nails
                        </h3>
                        <p className="text-xs text-gray-400 text-center mt-1">
                          Choose a look from our collection or upload a custom
                          design.
                        </p>
                      </button>

                      <button
                        onClick={() => setBookingScreen("Removal")}
                        className="flex flex-col items-center p-6 bg-[#1A1A1A] border border-white/10 rounded-2xl hover:border-[#FF007F]/50 transition-all group"
                      >
                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#FF007F] mb-3 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </div>
                        <h3 className="text-white font-bold text-lg">
                          Nail Removal
                        </h3>
                        <p className="text-xs text-gray-400 text-center mt-1">
                          Safely remove your current set.
                        </p>
                      </button>
                    </div>
                  )}

                  {/* 2. BESPOKE SUB-MENU */}
                  {bookingScreen === "BespokeSelection" && (
                    <div className="flex flex-col gap-4 py-8">
                      <p className="text-gray-400 text-sm text-center mb-4">
                        How would you like to choose your bespoke set?
                      </p>

                      <button
                        onClick={() => setBookingScreen("Custom")}
                        className="flex flex-col items-center p-6 bg-[#1A1A1A] border border-white/10 rounded-2xl hover:border-[#FF007F]/50 transition-all group"
                      >
                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#FF007F] mb-3 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </div>
                        <h3 className="text-white font-bold text-lg">
                          Custom Nail Set
                        </h3>
                        <p className="text-xs text-gray-400 text-center mt-1">
                          Upload your Pinterest board or reference.
                        </p>
                      </button>

                      <button
                        onClick={() => {
                          resetBooking();
                          if (onScrollToGallery)
                            setTimeout(() => onScrollToGallery(), 150);
                        }}
                        className="flex flex-col items-center p-6 bg-[#1A1A1A] border border-white/10 rounded-2xl hover:border-[#FF007F]/50 transition-all group"
                      >
                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#FF007F] mb-3 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              width="18"
                              height="18"
                              x="3"
                              y="3"
                              rx="2"
                              ry="2"
                            />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                        </div>
                        <h3 className="text-white font-bold text-lg">
                          Chosen Collection Set
                        </h3>
                        <p className="text-xs text-gray-400 text-center mt-1">
                          Browse the gallery below and pick a time.
                        </p>
                      </button>

                      <button
                        onClick={() => setBookingScreen("Selection")}
                        className="mt-4 text-sm text-gray-500 hover:text-white transition-colors text-center w-full"
                      >
                        ← Back to Services
                      </button>
                    </div>
                  )}

                  {/* 3. DETAILS PREVIEW & FORM */}
                  {isFormScreen && (
                    <>
                      {isCustomScreen ? (
                        <div className="flex flex-col items-center justify-center gap-3 bg-white/5 p-6 rounded-2xl border border-white/10 border-dashed relative">
                          <button
                            onClick={removeSelection}
                            className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                            title="Remove Selection"
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
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                          <div className="w-16 h-16 rounded-full bg-[#FF007F]/10 flex items-center justify-center text-[#FF007F]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                          </div>
                          <h3 className="text-white font-bold text-lg">
                            Custom Nail Art
                          </h3>
                        </div>
                      ) : isRemovalScreen ? (
                        <div className="flex flex-col items-center justify-center gap-3 bg-white/5 p-6 rounded-2xl border border-white/10 border-dashed relative">
                          <button
                            onClick={removeSelection}
                            className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                            title="Remove Selection"
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
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                          <div className="w-16 h-16 rounded-full bg-[#FF007F]/10 flex items-center justify-center text-[#FF007F]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </div>
                          <h3 className="text-white font-bold text-lg">
                            Nail Removal
                          </h3>
                          <p className="text-xs text-gray-400 text-center">
                            Select a date and time to remove your set.
                          </p>
                        </div>
                      ) : (
                        selectedDesign && (
                          <div className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 relative">
                            <button
                              onClick={removeSelection}
                              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                              title="Remove Selection"
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
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                            <img
                              src={selectedDesign.img}
                              alt="Selected"
                              className="w-24 h-32 object-cover rounded-lg"
                            />
                            <div className="flex flex-col justify-center pr-8">
                              <span className="text-[#FF007F] text-xs font-bold uppercase tracking-widest mb-1">
                                Selected Design
                              </span>
                              <h3 className="text-white font-bold text-lg leading-tight mb-2">
                                {selectedDesign.title}
                              </h3>
                            </div>
                          </div>
                        )
                      )}

                      <div className="space-y-4 pt-4 border-t border-white/10">
                        <div>
                          <label className="block text-gray-400 text-sm font-semibold mb-2">
                            Select Date
                          </label>
                          <BookingCalendar
                            onDateSelect={(date) => setSelectedDate(date)}
                            onTimeSelect={(time) => setSelectedTime(time)}
                            availableTimes={availableTimes}
                          />
                        </div>

                        {isCustomScreen && (
                          <div>
                            <label className="block text-gray-400 text-sm font-semibold mb-2">
                              Upload Inspiration Photo
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setCustomImage(
                                  e.target.files ? e.target.files[0] : null
                                )
                              }
                              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#FF007F]/20 file:text-[#FF007F] cursor-pointer"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-gray-400 text-sm font-semibold mb-2">
                            Special Requests
                          </label>
                          <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF007F] resize-none"
                            placeholder="Any specific colors or tweaks?"
                          ></textarea>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                {isFormScreen && (
                  <div className="p-6 border-t border-white/10 bg-[#1A1A1A] animate-in slide-in-from-bottom-2 duration-300">
                    <button
                      onClick={handleConfirmBooking}
                      disabled={isSubmitting}
                      className="w-full bg-[#FF007F] text-white font-bold uppercase tracking-wider py-4 rounded-xl hover:bg-[#ff1a8c] transition-all disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "Processing..."
                        : isCustomScreen
                        ? "Submit Request"
                        : "Request Booking"}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3">
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
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 sm:p-6"
        >
          <div
            className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
              selectedNail ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setSelectedNail(null)}
          />
          <div
            className={`relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 ease-out ${
              selectedNail
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4"
            }`}
          >
            <button
              onClick={() => setSelectedNail(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-gray-400 hover:text-white rounded-full backdrop-blur-md"
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

            <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-auto bg-[#1A1A1A]">
              <img
                src={selectedNail?.img}
                alt={selectedNail?.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col">
              <span className="text-[#FF007F] text-xs font-bold uppercase tracking-widest mb-2">
                Design Details
              </span>
              <h2 className="cormorant-garamond-header text-3xl sm:text-4xl font-bold text-white mb-4">
                {selectedNail?.title}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8">
                {selectedNail?.description}
              </p>

              <div className="space-y-4 mb-8">
                <div>
                  <span className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                    Shape
                  </span>
                  <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-md text-sm text-white">
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
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-sm text-white"
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
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-sm text-white"
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
                  if (nail) handleOpenBooking(nail);
                }}
                className="mt-auto w-full bg-[#FF007F] text-white font-bold uppercase tracking-wider py-4 rounded-xl hover:bg-[#ff1a8c] transition-all duration-300 shadow-[0_0_20px_rgba(255,0,127,0.3)]"
              >
                Book This Look
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-center mb-12">
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
        <h1 className="cormorant-garamond-header text-white font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl py-4 text-center">
          The Glossx.Claw Collections
        </h1>
        <p className="leading-tight inter-subcaption text-[#F9FAFB]/60 text-sm sm:text-base text-center max-w-2xl">
          Explore our latest handcrafted custom sets. Click any look to inspect
          the design specs or book it directly for your next appointment.
        </p>
      </div>

      {/* Filter UI */}
      <div className="w-full bg-transparent border border-white/10 p-6 sm:p-8 rounded-3xl mb-12 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-white font-bold text-lg">Filter Designs</h3>
            <p
              className={`${
                selectedFilters.length > 0 ? "hidden" : "block"
              } text-[#F9FAFB]/60 text-sm`}
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
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
        {selectedFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedFilters.map((filter) => (
              <span
                key={filter}
                className="flex items-center gap-1 bg-[#FF007F]/20 text-[#FF007F] px-3 py-1 rounded-full text-xs font-bold uppercase"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Gallery Grid */}
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
            onBookClick={() => handleOpenBooking(image)}
          />
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-white text-2xl font-bold mb-2">
            No designs found
          </h3>
          <p className="text-gray-400">
            Try clearing some filters to see more results.
          </p>
        </div>
      )}

      {visibleCount < filteredImages.length && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setVisibleCount(visibleCount + 8)}
            className="px-8 py-3.5 bg-[#FF007F] text-white text-sm font-bold uppercase tracking-widest rounded-full hover:bg-[#ff1a8c] transition-all"
          >
            Load More Looks
          </button>
        </div>
      )}

      {/* Custom Design Banner */}
      <div className="mt-16 border border-white/20 bg-white/5 rounded-3xl p-8 lg:p-10 gloss-border flex flex-col md:flex-row items-center justify-between gap-6 shadow-dark-card">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-sm font-extrabold uppercase tracking-widest text-[#FF007F]">
            Custom Design Request
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Have a Pinterest board or photo reference?
          </h3>
          <p className="text-sm text-gray-400">
            Send your photo reference on our social DMs or select custom set in
            our booking portal.
          </p>
        </div>
        <button
          onClick={() => handleOpenBooking("Custom")}
          className="whitespace-nowrap px-8 py-4 bg-[#FF007F] hover:bg-[#FF007F]/90 text-white font-extrabold text-xs uppercase tracking-widest rounded-full cursor-pointer shadow-[0_0_30px_rgba(255,0,127,0.4)] hover:shadow-[0_0_60px_rgba(255,0,127,0.4)] transition-all"
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
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedInThisDropdown = selected.filter((item) =>
    options.includes(item)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[#FF007F] text-xs font-bold uppercase tracking-widest mb-2">
        {title}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-black/50 border border-white/10 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF007F] transition-colors"
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
          className={`shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
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
          <div className="max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
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
                    className="accent-[#FF007F] w-4 h-4"
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