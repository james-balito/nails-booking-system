import { useState, useMemo, useEffect } from "react";
import supabase from "../config/supabaseClient";

interface BookingCalendarProps {
  onDateSelect?: (date: string) => void;
  onTimeSelect?: (time: string) => void;
}

// Helper: Converts "2:00 PM" to 840 (minutes)
const timeToMinutes = (timeStr: string) => {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (hours === 12 && modifier === "AM") hours = 0;
  if (modifier === "PM" && hours !== 12) hours += 12;
  return hours * 60 + minutes;
};

export default function BookingCalendar({
  onDateSelect,
  onTimeSelect,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Time states
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(true);
  const [selectedTime, setSelectedTime] = useState("");
  
  // Booked states
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isFetchingBookings, setIsFetchingBookings] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── 1. FETCH AVAILABLE TIMES FROM DB ON MOUNT ───────────────────────────
  useEffect(() => {
    const fetchTimes = async () => {
      setLoadingTimes(true);
      const { data, error } = await supabase
        .from("custom_times")
        .select("time")
        .eq("is_active", true);

      if (!error && data) {
        // Sort times chronologically
        const sorted = data
          .map((t) => t.time)
          .sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
        setAvailableTimes(sorted);
      }
      setLoadingTimes(false);
    };
    fetchTimes();
  }, []);

  // ── 2. BUFFER LOGIC (2 hours before, 4.5 hours after) ───────────────────
  const disabledTimes = useMemo(() => {
    const disabled: string[] = [];
    const BUFFER_MINUTES = 4.5 * 60;

    availableTimes.forEach((slot) => {
      const slotMinutes = timeToMinutes(slot);
      const isBlocked = bookedTimes.some((bookedTime) => {
        const bookedMinutes = timeToMinutes(bookedTime);
        const blockStart = bookedMinutes - 2 * 60;
        const blockEnd = bookedMinutes + BUFFER_MINUTES;
        return slotMinutes >= blockStart && slotMinutes <= blockEnd;
      });
      if (isBlocked) disabled.push(slot);
    });
    return disabled;
  }, [availableTimes, bookedTimes]);

  // ── 3. FETCH BOOKED TIMES WHEN DATE IS CLICKED ──────────────────────────
  const handleDateClick = async (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );

    if (clickedDate < today) return;

    setSelectedDate(clickedDate);
    setSelectedTime("");
    if (onTimeSelect) onTimeSelect("");

    const formattedDate = clickedDate.toISOString().split("T")[0];
    if (onDateSelect) onDateSelect(formattedDate);

    setIsFetchingBookings(true);
    try {
      // Use RPC to bypass RLS and safely read blocked times
      const { data, error } = await supabase.rpc("get_booked_times", {
        p_date: formattedDate,
      });

      if (error) {
        // Fallback to direct query if RPC fails
        const { data: directData, error: directError } = await supabase
          .from("bookings")
          .select("time")
          .eq("date", formattedDate)
          .neq("status", "cancelled");

        if (directError) throw directError;
        setBookedTimes(directData.map((b) => b.time));
      } else {
        setBookedTimes(data.map((b: any) => b.booked_time));
      }
    } catch (err) {
      console.error("Failed to fetch booked times:", err);
      setBookedTimes([]);
    } finally {
      setIsFetchingBookings(false);
    }
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    if (onTimeSelect) onTimeSelect(time);
  };

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const emptyDays = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-lg">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-10 sm:h-12" />
        ))}
        {days.map((day) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isPast = date < today;
          const isSelected = selectedDate?.getTime() === date.getTime();
          const isToday = date.getTime() === today.getTime();

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={isPast}
              className={`
                h-10 sm:h-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-all relative
                ${isPast ? "text-gray-600 cursor-not-allowed opacity-50" : isSelected ? "bg-[#FF007F] text-white shadow-[0_0_15px_rgba(255,0,127,0.4)] scale-105 z-10" : "text-gray-300 hover:bg-white/10 cursor-pointer"}
              `}
            >
              {day}
              {isToday && !isSelected && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#FF007F]"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* TIME SLOTS */}
      {selectedDate && (
        <div className="mt-6 pt-6 border-t border-white/10 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-bold text-sm">Available Times</h4>
            {!isFetchingBookings && bookedTimes.length > 0 && (
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                Unavailable windows applied
              </span>
            )}
          </div>

          {loadingTimes || isFetchingBookings ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-4">
              <svg className="animate-spin h-4 w-4 text-[#FF007F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking availability...
            </div>
          ) : availableTimes.length === 0 ? (
            <div className="text-xs text-gray-400 py-4">
              No time slots available. Please check back later.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map((time) => {
                const isDisabled = disabledTimes.includes(time);

                return (
                  <button
                    key={time}
                    disabled={isDisabled}
                    onClick={() => handleTimeClick(time)}
                    className={`py-2 px-3 rounded-lg text-sm font-bold border transition-all ${
                      isDisabled
                        ? "bg-black/40 border-white/5 text-gray-600 cursor-not-allowed line-through"
                        : selectedTime === time
                          ? "bg-[#FF007F] border-[#FF007F] text-white"
                          : "bg-white/5 border-white/10 text-gray-300 hover:border-[#FF007F]/50"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}