import { useState } from "react";

interface BookingCalendarProps {
  onDateSelect?: (date: string) => void;
  onTimeSelect?: (time: string) => void;
  availableTimes: string[];
}

export default function BookingCalendar({ 
  onDateSelect, 
  onTimeSelect, 
  availableTimes 
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // State for Time Slots
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const emptyDays = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // 👇 MOCK DATABASE LOGIC (Simulating booked times)
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (clickedDate < today) return;

    setSelectedDate(clickedDate);
    setSelectedTime(""); // Reset time
    if (onTimeSelect) onTimeSelect("");

    const formattedDate = clickedDate.toISOString().split("T")[0];
    if (onDateSelect) onDateSelect(formattedDate);

    // 👇 Instead of fetching from Supabase, we mock it locally.
    // Let's pretend that on even days, 10:00 AM and 2:00 PM are booked.
    // On odd days, only 1:00 PM is booked.
    setIsFetching(true);
    
    setTimeout(() => {
      if (day % 2 === 0) {
        setBookedTimes(["10:00 AM", "2:00 PM"]);
      } else {
        setBookedTimes(["1:00 PM"]);
      }
      setIsFetching(false);
    }, 300); // Fake loading delay
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    if (onTimeSelect) onTimeSelect(time);
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-lg">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button onClick={handleNextMonth} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase py-2">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => <div key={`empty-${index}`} className="h-10 sm:h-12" />)}
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
              {isToday && !isSelected && <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#FF007F]"></span>}
            </button>
          );
        })}
      </div>

      {/* TIME SLOTS POPUP */}
      {selectedDate && (
        <div className="mt-6 pt-6 border-t border-white/10 animate-in slide-in-from-top-2 fade-in duration-300">
          <h4 className="text-white font-bold text-sm mb-3">Available Times</h4>
          
          {isFetching ? (
            <p className="text-xs text-gray-400">Checking availability...</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map((time) => {
                const isBooked = bookedTimes.includes(time);
                return (
                  <button
                    key={time}
                    disabled={isBooked}
                    onClick={() => handleTimeClick(time)}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all border ${
                      isBooked
                        ? "bg-red-500/10 border-red-500/20 text-red-500/50 cursor-not-allowed line-through"
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