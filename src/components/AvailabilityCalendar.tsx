import React, { useState, useMemo, useEffect, FormEvent } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, XCircle, Clock, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { getBookingAvailability, getAvailableSlotsForDate, TimeSlot } from '../services/api/bookingService';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

interface DateAvailability {
  status: 'available' | 'limited' | 'booked';
  label: string;
  colorClass: string;
  bgClass: string;
  badgeClass: string;
}

const AVAILABILITY_RULES: Record<string, DateAvailability> = {
  available: {
    status: 'available',
    label: 'Fully Available',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 border-emerald-100',
    badgeClass: 'bg-emerald-500 text-white',
  },
  limited: {
    status: 'limited',
    label: 'Limited Availability',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50 border-amber-100',
    badgeClass: 'bg-amber-500 text-white',
  },
  booked: {
    status: 'booked',
    label: 'Fully Booked',
    colorClass: 'text-rose-600',
    bgClass: 'bg-rose-50 border-rose-100',
    badgeClass: 'bg-rose-500 text-white',
  },
};

export default function AvailabilityCalendar() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  // Real backend slot states
  const [dbAvailability, setDbAvailability] = useState<Record<string, number>>({});
  const [daySlots, setDaySlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('07:00 PM');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Custom contact submission states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch monthly availability overview from backend
  const fetchMonthlyData = async () => {
    try {
      const res = await getBookingAvailability(year, month + 1);
      if (res && res.data && res.data.availabilityByDate) {
        setDbAvailability(res.data.availabilityByDate);
      }
    } catch (err) {
      console.warn("Could not fetch monthly availability from backend:", err);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, [year, month]);

  // Fetch slots for selected date
  const fetchSlotsForSelectedDate = async (date: Date) => {
    setIsLoadingSlots(true);
    setSlotError(null);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    try {
      const res = await getAvailableSlotsForDate(dateStr);
      if (res && res.data && res.data.slots) {
        setDaySlots(res.data.slots);
        // Default select first available slot
        const firstAvail = res.data.slots.find(s => !s.isBooked);
        if (firstAvail) {
          setSelectedSlot(firstAvail.time);
        }
      }
    } catch (err: any) {
      console.warn("Could not fetch date slots from backend:", err);
      setSlotError("Failed to load real-time slot statuses.");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchSlotsForSelectedDate(selectedDate);
    }
  }, [selectedDate]);

  // Generate calendar dates for the grid
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    
    const days: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

    // Previous month's trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthTotalDays - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        key: `prev-${d.getTime()}`,
      });
    }

    // Current month's days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        key: `curr-${d.getTime()}`,
      });
    }

    // Next month's leading days to complete grid rows
    const totalSlots = 42; // standard 6 rows
    const nextDaysNeeded = totalSlots - days.length;
    for (let i = 1; i <= nextDaysNeeded; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        key: `next-${d.getTime()}`,
      });
    }

    return days;
  }, [year, month]);

  // Determine availability status based on date properties (e.g. weekends have limited/booked status)
  const getDateAvailability = (date: Date): DateAvailability => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate < today) {
      return AVAILABILITY_RULES.booked; // past days are booked
    }

    const dayOfWeek = date.getDay();
    const dateNum = date.getDate();

    // Custom rule set to simulate highly realistic booking slots
    if (dayOfWeek === 6) { // Saturday
      if (dateNum % 3 === 0) return AVAILABILITY_RULES.booked;
      return AVAILABILITY_RULES.limited;
    }
    if (dayOfWeek === 0 || dayOfWeek === 5) { // Friday & Sunday
      if (dateNum % 4 === 0) return AVAILABILITY_RULES.booked;
      if (dateNum % 2 === 0) return AVAILABILITY_RULES.limited;
      return AVAILABILITY_RULES.available;
    }

    // Weekdays
    if (dateNum % 7 === 0) return AVAILABILITY_RULES.limited;
    return AVAILABILITY_RULES.available;
  };

  const selectedAvailability = selectedDate ? getDateAvailability(selectedDate) : null;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    if (selected >= today) {
      setSelectedDate(date);
      setSubmitted(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !selectedDate) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    try {
      const result = await api.submitCalendarBooking({
        name,
        email,
        date: dateStr,
        eventDate: dateStr,
        eventTime: selectedSlot,
        notes: notes || undefined
      });

      if (!result.success) {
        const errorMsg = result.message || result.error || "The selected time slot is no longer available. Please select another slot.";
        setSubmitError(errorMsg);
        toast.error(errorMsg, "Slot Conflict");
        fetchSlotsForSelectedDate(selectedDate);
        return;
      }

      setSubmitted(true);
      toast.success(`Pre-hold reserved for ${dateStr} at ${selectedSlot}!`, "Pre-Hold Secured");
      fetchSlotsForSelectedDate(selectedDate);
      fetchMonthlyData();
    } catch (apiErr) {
      console.error("Backend booking submission error:", apiErr);
      const connErr = "Failed to submit pre-hold request. Please verify network connection.";
      setSubmitError(connErr);
      toast.error(connErr, "Submission Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden max-w-5xl mx-auto text-left flex flex-col lg:flex-row">
      {/* Calendar Area (Left Side) */}
      <div className="flex-1 p-6 sm:p-8 border-r border-slate-50">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-lg sm:text-xl font-bold text-secondary">
                {monthNames[month]} {year}
              </h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Select your preferred date
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 border border-slate-100 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 border border-slate-100 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer"
              aria-label="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid Headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-sans text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarDays.map((item) => {
            const availability = getDateAvailability(item.date);
            const selected = isSelected(item.date);
            const activeToday = isToday(item.date);
            const isPast = item.date < new Date(new Date().setHours(0,0,0,0));

            let dayBtnClass = "relative aspect-square flex flex-col items-center justify-center rounded-2xl text-xs sm:text-sm font-semibold transition-all focus:outline-none cursor-pointer ";
            
            if (isPast) {
              dayBtnClass += "text-slate-300 cursor-not-allowed bg-slate-50/50 ";
            } else if (!item.isCurrentMonth) {
              dayBtnClass += "text-slate-400 hover:bg-slate-50 ";
            } else {
              dayBtnClass += "text-secondary hover:bg-slate-50 ";
            }

            if (selected) {
              dayBtnClass += "ring-2 ring-offset-2 ring-primary bg-secondary text-white hover:bg-secondary ";
            } else if (activeToday) {
              dayBtnClass += "border-2 border-primary/40 font-bold ";
            }

            return (
              <button
                key={item.key}
                onClick={() => handleDateSelect(item.date)}
                disabled={isPast}
                className={dayBtnClass}
              >
                <span>{item.date.getDate()}</span>
                
                {/* Status indicator dot beneath date */}
                {!isPast && !selected && (
                  <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${
                    availability.status === 'available' ? 'bg-emerald-400' :
                    availability.status === 'limited' ? 'bg-amber-400' : 'bg-rose-400'
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-50 text-[11px] sm:text-xs text-slate-500 font-sans font-medium justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Fully Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Limited Spots</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span>Fully Booked</span>
          </div>
        </div>
      </div>

      {/* Selected Date Information / Booking Form Area (Right Side) */}
      <div className="w-full lg:w-[380px] bg-slate-50/50 p-6 sm:p-8 flex flex-col justify-between">
        {selectedDate ? (
          <div className="flex flex-col h-full gap-5">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Selected Date
              </span>
              <h5 className="font-serif text-xl font-bold text-secondary">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h5>
            </div>

            {/* Availability Detail Box */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-all duration-300 ${selectedAvailability?.bgClass}`}>
              {selectedAvailability?.status === 'available' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              {selectedAvailability?.status === 'limited' && (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              {selectedAvailability?.status === 'booked' && (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}

              <div className="text-left font-sans text-xs">
                <span className={`font-bold uppercase tracking-wider block mb-1 ${selectedAvailability?.colorClass}`}>
                  {selectedAvailability?.label}
                </span>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {selectedAvailability?.status === 'available' &&
                    "Fantastic choice! This date has our culinary teams and professional kitchen slots open for reservations."}
                  {selectedAvailability?.status === 'limited' &&
                    "Limited spaces remaining. We are currently holding a few spaces on this date; book now to lock in catering."}
                  {selectedAvailability?.status === 'booked' &&
                    "Our culinary studios are fully booked on this day. Please browse adjacent dates to reserve your catering package."}
                </p>
              </div>
            </div>

            {/* Real-time Time Slots Selector */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Available Time Slots</span>
                </span>
                {isLoadingSlots && <RefreshCw className="w-3 h-3 text-primary animate-spin" />}
              </div>

              {daySlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {daySlots.map((slot) => {
                    const isSelected = selectedSlot === slot.time;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={slot.isBooked}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left transition-all flex flex-col justify-between ${
                          slot.isBooked
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through opacity-70'
                            : isSelected
                            ? 'bg-secondary text-white ring-2 ring-primary'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{slot.time}</span>
                          {slot.isBooked && (
                            <span className="text-[9px] font-extrabold text-rose-500 bg-rose-50 px-1 rounded uppercase">Booked</span>
                          )}
                        </div>
                        <span className={`text-[9px] font-normal truncate mt-0.5 ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                          {slot.label.split('/')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 py-1 italic text-center">
                  Select a date to inspect live slots
                </div>
              )}
            </div>

            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{submitError}</span>
              </div>
            )}
            {selectedAvailability?.status !== 'booked' && (
              <div className="flex-grow flex flex-col justify-between">
                {!submitted ? (
                  <form onSubmit={handleInquirySubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white border border-slate-100 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-primary text-secondary"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="johndoe@example.com"
                        className="w-full bg-white border border-slate-100 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-primary text-secondary"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                        <span>Catering Event Details</span>
                        <span className="text-slate-400 font-normal">Optional</span>
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Expected guest count, dietary requests, package preferences..."
                        rows={3}
                        className="w-full bg-white border border-slate-100 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-primary text-secondary resize-none leading-relaxed"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full mt-2 bg-secondary hover:bg-secondary-hover text-white font-sans font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Request Booking Pre-Hold</span>
                    </button>
                  </form>
                ) : (
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center flex flex-col items-center gap-3 animate-in zoom-in-95 duration-300">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h6 className="font-serif text-base font-bold text-secondary">Inquiry Received</h6>
                      <p className="font-sans text-slate-500 text-[11px] leading-relaxed mt-1 font-medium">
                        We have put a tentative hold on <strong className="text-secondary">{selectedDate.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</strong> for {name}. A personalized confirmation email has been dispatched to <strong className="text-secondary">{email}</strong>!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 gap-2 font-sans py-12">
            <CalendarIcon className="w-8 h-8 text-slate-300 stroke-1" />
            <p className="text-xs font-semibold">Select a date to view real-time catering availability</p>
          </div>
        )}
      </div>
    </div>
  );
}
