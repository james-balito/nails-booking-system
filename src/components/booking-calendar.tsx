import { useState } from "react";

interface BookingCalendarProps {
  // Optional: Pass a callback to get the selected date in the parent component
  onDateSelect?: (date: string) => void; 
}

export default function BookingCalendar({ onDateSelect }: BookingCalendarProps) {
  // Start the calendar on the current month/year
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get today's date for disabling past days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper: Get the number of days in the current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  // Create an array of empty slots for the days before the 1st of the month
  const emptyDays = Array(firstDay).fill(null);
  
  // Create an array of actual days [1, 2, 3... 31]
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Prevent clicking past dates
    if (clickedDate < today) return;

    setSelectedDate(clickedDate);
    
    // Format as YYYY-MM-DD for Supabase
    const formattedDate = clickedDate.toISOString().split("T")[0];
    
    if (onDateSelect) {
      onDateSelect(formattedDate);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
      
      {/* Header: Month & Year + Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-lg">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={handlePrevMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Days of the Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty slots for days before the 1st */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-10 sm:h-12" />
        ))}

        {/* Actual Days */}
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
                ${isPast 
                  ? "text-gray-600 cursor-not-allowed opacity-50" 
                  : isSelected
                    ? "bg-[#FF007F] text-white shadow-[0_0_15px_rgba(255,0,127,0.4)] scale-105 z-10"
                    : "text-gray-300 hover:bg-white/10 cursor-pointer"
                }
              `}
            >
              {day}
              
              {/* Small dot indicating "Today" */}
              {isToday && !isSelected && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#FF007F]"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Summary */}
      {selectedDate && (
        <div className="mt-6 p-3 rounded-xl bg-[#FF007F]/10 border border-[#FF007F]/20 flex items-center justify-between">
          <span className="text-sm text-gray-300">Selected Date:</span>
          <span className="text-sm font-bold text-[#FF007F]">
            {selectedDate.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  );
}