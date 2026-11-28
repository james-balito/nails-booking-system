import { useState, useMemo, useEffect } from "react";
import supabase from "../config/supabaseClient";

interface BookingCalendarProps {
  onDateSelect?: (date: string) => void;
  onTimeSelect?: (time: string) => void;
}

interface ScheduleRule {
  start_date: string;
  end_date: string;
  is_blocked: boolean;
  custom_times: string[] | null;
}

// Convert "2:00 PM" to minutes (for sorting + buffer)
const timeToMinutes = (timeStr: string) => {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (hours === 12 && modifier === "AM") hours = 0;
  if (modifier === "PM" && hours !== 12) hours += 12;
  return hours * 60 + minutes;
};

// Format Date to YYYY-MM-DD in LOCAL time (avoids UTC shift)
const toLocalIso = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function BookingCalendar({
  onDateSelect,
  onTimeSelect,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Data
  const [defaultTimes, setDefaultTimes] = useState<string[]>([]);
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [activeTimes, setActiveTimes] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  // Loading
  const [loading, setLoading] = useState(true);
  const [isFetchingBookings, setIsFetchingBookings] = useState(false);

  const [selectedTime, setSelectedTime] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── 1. FETCH DEFAULT TIMES + SCHEDULE RULES ON MOUNT ───────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [timesRes, rulesRes] = await Promise.all([
        supabase.from("custom_times").select("time").eq("is_active", true),
        supabase
          .from("schedule_rules")
          .select("start_date, end_date, is_blocked, custom_times"),
      ]);

      if (timesRes.data) {
        const sorted = timesRes.data
          .map((t) => t.time)
          .sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
        setDefaultTimes(sorted);
      }

      if (rulesRes.data) {
        setRules(rulesRes.data as ScheduleRule[]);
      }

      setLoading(false);
    };
    fetch();
  }, []);

  // ── 2. MAP every date in every span to its rule ─────────────────────────
  const rulesMap = useMemo(() => {
    const map: Record<string, ScheduleRule> = {};
    rules.forEach((r) => {
      const start = new Date(r.start_date + "T00:00:00");
      const end = new Date((r.end_date || r.start_date) + "T00:00:00");

      // Fill every day in the range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const iso = toLocalIso(d);
        map[iso] = r;
      }
    });
    return map;
  }, [rules]);

  // ── 3. Buffer logic (2h before, 4.5h after) ────────────────────────────
  const disabledTimes = useMemo(() => {
    const disabled: string[] = [];
    const BUFFER = 4.5 * 60;

    activeTimes.forEach((slot) => {
      const slotMinutes = timeToMinutes(slot);
      const isBlocked = bookedTimes.some((b) => {
        const bookedMinutes = timeToMinutes(b);
        return (
          slotMinutes >= bookedMinutes - 2 * 60 &&
          slotMinutes <= bookedMinutes + BUFFER
        );
      });
      if (isBlocked) disabled.push(slot);
    });
    return disabled;
  }, [activeTimes, bookedTimes]);

  // ── 4. Handle date click ────────────────────────────────────────────────
  const handleDateClick = async (day: number) => {
    const clicked = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    if (clicked < today) return;

    const iso = toLocalIso(clicked);
    const rule = rulesMap[iso];

    // Blocked → do nothing
    if (rule?.is_blocked) return;

    // Determine active times for this date
    let times = defaultTimes;
    if (rule?.custom_times && rule.custom_times.length > 0) {
      times = [...rule.custom_times].sort(
        (a, b) => timeToMinutes(a) - timeToMinutes(b),
      );
    }
    setActiveTimes(times);

    // Update state
    setSelectedDate(clicked);
    setSelectedTime("");
    if (onTimeSelect) onTimeSelect("");
    if (onDateSelect) onDateSelect(iso);

    // Fetch booked times
    setIsFetchingBookings(true);
    try {
      const { data, error } = await supabase.rpc("get_booked_times", {
        p_date: iso,
      });

      if (error) {
        const { data: direct } = await supabase
          .from("bookings")
          .select("time")
          .eq("date", iso)
          .neq("status", "cancelled");
        setBookedTimes(direct?.map((b) => b.time) ?? []);
      } else {
        setBookedTimes(data?.map((b: any) => b.booked_time) ?? []);
      }
    } catch (err) {
      console.error("Booked times fetch failed:", err);
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
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const handleNextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  // Calendar math
  const getDaysInMonth = (y: number, m: number) =>
    new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) =>
    new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );
  const firstDay = getFirstDayOfMonth(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );
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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-10 sm:h-12" />
        ))}
        {days.map((day) => {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day,
          );
          const iso = toLocalIso(date);
          const isPast = date < today;
          const isBlocked = rulesMap[iso]?.is_blocked === true;
          const isSelected = selectedDate?.getTime() === date.getTime();
          const isToday = date.getTime() === today.getTime();

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={isPast || isBlocked}
              title={isBlocked ? "Unavailable" : undefined}
              className={`
                h-10 sm:h-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-all relative
                ${isPast ? "text-gray-600 cursor-not-allowed opacity-50" : ""}
                ${isBlocked ? "text-gray-500 line-through bg-red-500/5 cursor-not-allowed" : ""}
                ${isSelected ? "bg-[#FF007F] text-white shadow-[0_0_15px_rgba(255,0,127,0.4)] scale-105 z-10" : ""}
                ${!isPast && !isBlocked && !isSelected ? "text-gray-300 hover:bg-white/10 cursor-pointer" : ""}
              `}
            >
              {day}
              {isToday && !isSelected && !isBlocked && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#FF007F]"></span>
              )}
              {isBlocked && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-bold text-sm">Available Times</h4>
            {!isFetchingBookings && bookedTimes.length > 0 && (
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                Buffer applied
              </span>
            )}
          </div>

          {loading || isFetchingBookings ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-4">
              <svg className="animate-spin h-4 w-4 text-[#FF007F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking availability...
            </div>
          ) : activeTimes.length === 0 ? (
            <div className="text-xs text-gray-400 py-4">
              No time slots available for this date.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {activeTimes.map((time) => {
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