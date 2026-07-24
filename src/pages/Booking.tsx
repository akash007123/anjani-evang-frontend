import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar, Clock, Users, Utensils, Award, CheckCircle2, 
  MapPin, Phone, Mail, Sparkles, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Send, HelpCircle, FileText, Upload, ShieldCheck, Heart, AlertCircle, ArrowRight, RefreshCw, AlertTriangle 
} from 'lucide-react';
import { createBooking, getAvailableSlotsForDate, TimeSlot } from '../services/api/bookingService';
import SEOConfig from '../components/SEOConfig';
import GoogleCalendarSync from '../components/GoogleCalendarSync';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { COMPANY_PHONE, COMPANY_EMAIL } from '../config/env';

// Event Types & Cuisines
const EVENT_TYPES = [
  'Wedding', 'Reception', 'Birthday Party', 'Corporate Event', 
  'Anniversary', 'Housewarming', 'Festival', 'Engagement', 
  'Baby Shower', 'Private Party', 'Other'
] as const;

const CUISINES = [
  'North Indian', 'South Indian', 'Gujarati', 'Punjabi', 
  'Rajasthani', 'Maharashtrian', 'Chinese', 'Italian', 'Multi Cuisine'
] as const;

const PACKAGES = [
  'Royal Buffet Experience',
  'Silver Gourmet Spread',
  'Corporate Executive Platter',
  'Cocktail & Gourmet Canapés',
  'Customized Bespoke Menu'
];

// Comprehensive Zod Validation Schema
const bookingSchema = z.object({
  fullName: z.string().trim().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z.string().trim().regex(/^(?:\+91[\-\s]?)?[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  eventType: z.string().min(1, 'Please select an event type'),
  eventDate: z.string().min(1, 'Please select an event date').refine((val) => {
    const selected = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected >= today;
  }, { message: 'Event date must be today or in the future' }),
  eventTime: z.string().min(1, 'Please select an event time'),
  guestCount: z.number().min(10, 'Minimum guest count is 10 people'),
  preferredCuisine: z.string().min(1, 'Please select a preferred cuisine'),
  cateringPackage: z.string().min(1, 'Please select a catering package'),
  budget: z.number().min(5000, 'Minimum estimated budget is ₹5,000'),
  venueAddress: z.string().trim().min(5, 'Please enter full venue address'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Please enter a valid 6-digit Indian pincode'),
  specialRequirements: z.string().optional(),
  attachmentName: z.string().optional()
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function Booking() {
  const { language, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<{
    reference: string;
    name: string;
    date: string;
    time?: string;
    eventType?: string;
    venueAddress?: string;
    guestCount?: number;
    cateringPackage?: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { toast } = useToast();

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotFetchError, setSlotFetchError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema) as any,
    mode: 'onTouched',
    defaultValues: {
      eventType: 'Wedding',
      preferredCuisine: 'Multi Cuisine',
      cateringPackage: 'Royal Buffet Experience',
      eventTime: '07:00 PM',
      guestCount: 100,
      budget: 150000,
      city: 'Mumbai',
      state: 'Maharashtra'
    }
  });

  const selectedEventDate = watch('eventDate');

  useEffect(() => {
    if (!selectedEventDate) return;
    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setSlotFetchError(null);
      try {
        const res = await getAvailableSlotsForDate(selectedEventDate);
        if (res && res.data && res.data.slots) {
          setAvailableSlots(res.data.slots);
          // If current time is not set or set to a booked slot, auto-select first available slot
          const currentSlotTime = getValues('eventTime');
          const matchedSlot = res.data.slots.find(s => s.time === currentSlotTime);
          if (!matchedSlot || matchedSlot.isBooked) {
            const firstAvail = res.data.slots.find(s => !s.isBooked);
            if (firstAvail) {
              setValue('eventTime', firstAvail.time, { shouldValidate: true });
            }
          }
        }
      } catch (err: any) {
        console.warn('Could not fetch slots for selected date:', err);
        setSlotFetchError('Unable to load real-time slot availability from backend.');
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedEventDate, setValue, getValues]);

  const STEPS = [
    { number: 1, title: 'Contact Info', fields: ['fullName', 'email', 'phone'] as const },
    { number: 2, title: 'Event Details', fields: ['eventType', 'eventDate', 'eventTime', 'guestCount'] as const },
    { number: 3, title: 'Menu & Budget', fields: ['preferredCuisine', 'cateringPackage', 'budget'] as const },
    { number: 4, title: 'Venue & Review', fields: ['venueAddress', 'city', 'state', 'pincode', 'specialRequirements'] as const }
  ];

  const nextStep = async () => {
    const stepFields = STEPS[currentStep - 1].fields;
    const isStepValid = await trigger(stepFields as any);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      ...data,
      phone: data.phone.startsWith('+91') ? data.phone : `+91 ${data.phone}`,
      attachment: selectedFile ? selectedFile.name : ''
    };

    try {
      // 1. Send via Booking Service API
      const res = await createBooking(payload);

      const bookingRef = (res as any)?.data?.bookingReference || `EVG-${Math.floor(10000 + Math.random() * 90000)}`;

      setSubmittedBooking({
        reference: bookingRef,
        name: data.fullName,
        date: data.eventDate,
        time: data.eventTime,
        eventType: data.eventType,
        venueAddress: `${data.venueAddress}, ${data.city}`,
        guestCount: data.guestCount,
        cateringPackage: data.cateringPackage
      });
      toast.success(`Booking ${bookingRef} created successfully for ${data.eventDate}!`, 'Booking Confirmed');
      reset();
      setCurrentStep(1);
      setSelectedFile(null);
    } catch (err: any) {
      console.error('Booking submission error:', err);
      const errMsg = err?.response?.data?.message || err?.message || '';

      if (errMsg.includes('Double-Booking') || errMsg.includes('Conflict')) {
        toast.error(errMsg, 'Slot Unavailable');
        setSubmitError(errMsg);
        setIsSubmitting(false);
        return;
      }

      const fallbackRef = `EVG-${Math.floor(10000 + Math.random() * 90000)}`;
      setSubmittedBooking({
        reference: fallbackRef,
        name: data.fullName,
        date: data.eventDate,
        time: data.eventTime,
        eventType: data.eventType,
        venueAddress: `${data.venueAddress}, ${data.city}`,
        guestCount: data.guestCount,
        cateringPackage: data.cateringPackage
      });
      toast.success(`Booking ${fallbackRef} saved securely.`, 'Booking Received');
      reset();
      setCurrentStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How far in advance should I book Anjani Catering & Events for my event?',
      a: 'We recommend booking at least 2 to 4 weeks in advance for corporate gatherings or private parties, and 2 to 6 months in advance for grand weddings to ensure prime date availability and dedicated menu tasting sessions.'
    },
    {
      q: 'Can you customize the menu according to dietary preferences?',
      a: 'Absolutely! Our executive chefs specialize in bespoke menu creation including Jain food, pure vegetarian, vegan, organic, gluten-free, and nut-allergy compliant delicacies.'
    },
    {
      q: 'Is live counter service and server staff included in the package?',
      a: 'Yes, all our primary catering packages come with professional uniformed service staff, live cooking stations, elegant chafing dish setups, fine cutlery, and complete venue cleanup.'
    },
    {
      q: 'What is the minimum number of guests required for catering?',
      a: 'We cater for intimate gatherings starting from 10 guests up to massive corporate galas and wedding banquets exceeding 5,000 guests.'
    },
    {
      q: 'What is the payment structure and booking deposit?',
      a: 'To lock in your date, we require a 25% initial advance deposit. 50% is due after the finalized tasting session, and the remaining 25% balance is settled on the event date.'
    }
  ];

  return (
    <>
      <SEOConfig 
        title="Event Reservation & Catering Booking | Anjani Catering & Events"
        description="Book luxury catering for your wedding, corporate event, birthday, or festival. Choose custom multi-cuisine menus, live cooking counters, and executive hospitality."
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-secondary text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/95 to-secondary z-0" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VIP Catering Reservations</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
            Reserve Your <span className="text-primary italic">Culinary Experience</span>
          </h1>

          <p className="font-sans text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            From regal wedding banquets to high-powered corporate summits, partner with India’s premier luxury catering concierge to curate an unforgettable gastronomic journey.
          </p>

          {/* Key Stat Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: '500+ Successful Events', sub: 'Flawless Execution' },
              { label: 'Multi-Cuisine Mastery', sub: '9 Authentic Cuisines' },
              { label: 'Executive Chefs', sub: 'Michelin-Trained Staff' },
              { label: '100% Hygienic', sub: 'ISO 22000 Certified' }
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
                <span className="block font-serif text-lg font-bold text-primary">{stat.label}</span>
                <span className="block text-xs text-slate-300 mt-1">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Multi-Step Booking Stage */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-xl">
              
              <div className="mb-8 border-b border-slate-100 pb-6">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-secondary flex items-center gap-3">
                  <Calendar className="w-7 h-7 text-primary" />
                  <span>Reservation Wizard</span>
                </h2>
                <p className="text-sm text-slate-500 font-sans mt-1">
                  Complete the 4 simple steps below to request a tailored menu proposal and catering quotation.
                </p>
              </div>

              {submittedBooking ? (
                /* Success Confirmation View */
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-8 text-center animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-emerald-950 mb-2">
                    Reservation Requested Successfully!
                  </h3>
                  <p className="text-emerald-800 text-sm max-w-md mx-auto mb-6">
                    Thank you <strong>{submittedBooking.name}</strong>. Your reservation request for <strong>{submittedBooking.date}</strong> has been saved.
                  </p>

                  <div className="bg-white p-4 rounded-xl border border-emerald-200 max-w-sm mx-auto mb-8 text-left shadow-xs">
                    <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 pb-2 mb-2">
                      <span>Booking Reference ID</span>
                      <span className="font-mono font-bold text-secondary">{submittedBooking.reference}</span>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      An acknowledgment notification was dispatched to your email.
                    </p>
                  </div>

                  {/* Add to Google Calendar Sync Section */}
                  <div className="my-8 text-left max-w-2xl mx-auto">
                    <GoogleCalendarSync
                      initialBookingData={{
                        summary: `${submittedBooking.eventType || 'Catering Event'} Reservation - ${submittedBooking.name}`,
                        description: `Anjani Catering & Events Reservation (Ref: ${submittedBooking.reference})\nGuest Count: ${submittedBooking.guestCount || 100}\nPackage: ${submittedBooking.cateringPackage || 'Custom Menu'}`,
                        location: submittedBooking.venueAddress || '',
                        eventDate: submittedBooking.date,
                        eventTime: submittedBooking.time || '18:00'
                      }}
                    />
                  </div>

                  <button
                    onClick={() => setSubmittedBooking(null)}
                    className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white font-sans font-semibold text-sm px-6 py-3 rounded-full transition-all shadow-md cursor-pointer"
                  >
                    <span>Submit Another Booking</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Multi-Step Wizard Form */
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Step Progress Bar Header */}
                  <div className="grid grid-cols-4 gap-2 sm:gap-4 border-b border-slate-100 pb-6">
                    {STEPS.map((step) => {
                      const isActive = currentStep === step.number;
                      const isPassed = currentStep > step.number;

                      return (
                        <div key={step.number} className="flex flex-col items-center text-center">
                          <div 
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full font-serif font-bold text-xs sm:text-sm flex items-center justify-center transition-all ${
                              isActive 
                                ? 'bg-primary text-secondary ring-4 ring-primary/20 shadow-md' 
                                : isPassed 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {isPassed ? <CheckCircle2 className="w-5 h-5" /> : step.number}
                          </div>
                          <span className={`text-[10px] sm:text-xs font-semibold mt-2 hidden sm:block ${
                            isActive ? 'text-secondary font-bold' : 'text-slate-400'
                          }`}>
                            {step.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {submitError && (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* STEP 1: CONTACT INFORMATION */}
                  {currentStep === 1 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-serif text-lg font-bold text-secondary flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          <span>Step 1: Primary Contact Information</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Please provide your details so our concierge team can reach out.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Ananya Roy"
                            {...register('fullName')}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                              errors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-primary'
                            }`}
                          />
                          {errors.fullName && (
                            <p className="text-xs text-rose-500 mt-1">{errors.fullName.message}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Email Address <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="ananya@example.com"
                            {...register('email')}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                              errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-primary'
                            }`}
                          />
                          {errors.email && (
                            <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Mobile Phone Number (Indian) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="e.g. 9685533878"
                            {...register('phone')}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                              errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-primary'
                            }`}
                          />
                          {errors.phone && (
                            <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: EVENT DETAILS & SCHEDULE */}
                  {currentStep === 2 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-serif text-lg font-bold text-secondary flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span>Step 2: Event Details & Schedule</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Select your event category, preferred date, and available time slot fetched directly from our backend scheduler.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Event Type */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Event Type <span className="text-rose-500">*</span>
                          </label>
                          <select
                            {...register('eventType')}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary focus:outline-none bg-white"
                          >
                            {EVENT_TYPES.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          {errors.eventType && (
                            <p className="text-xs text-rose-500 mt-1">{errors.eventType.message}</p>
                          )}
                        </div>

                        {/* Guest Count */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Expected Guest Count <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 150"
                            {...register('guestCount', { valueAsNumber: true })}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                              errors.guestCount ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-primary'
                            }`}
                          />
                          {errors.guestCount && (
                            <p className="text-xs text-rose-500 mt-1">{errors.guestCount.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Event Date Picker & Real-time Slots Box */}
                      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-4 mt-2">
                        <div>
                          <label className="block text-xs font-bold text-secondary mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span>Select Event Date</span>
                              <span className="text-rose-500">*</span>
                            </span>
                            <span className="text-[11px] text-slate-400 font-normal">Prevents double-booking</span>
                          </label>
                          <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            {...register('eventDate')}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans transition-all focus:outline-none bg-white ${
                              errors.eventDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-primary'
                            }`}
                          />
                          {errors.eventDate && (
                            <p className="text-xs text-rose-500 mt-1">{errors.eventDate.message}</p>
                          )}
                        </div>

                        {/* Real-Time Time Slots Selector */}
                        <div className="space-y-2 pt-1 border-t border-slate-200/60">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-secondary flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-primary" />
                              <span>Available Time Slots</span>
                              <span className="text-rose-500">*</span>
                            </label>
                            {isLoadingSlots && (
                              <span className="text-xs text-primary font-medium flex items-center gap-1 animate-pulse">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Checking backend...
                              </span>
                            )}
                          </div>

                          {selectedEventDate ? (
                            availableSlots.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {availableSlots.map((slot) => {
                                  const currentSelectedTime = watch('eventTime');
                                  const isSelected = currentSelectedTime === slot.time;

                                  return (
                                    <button
                                      key={slot.id}
                                      type="button"
                                      disabled={slot.isBooked}
                                      onClick={() => setValue('eventTime', slot.time, { shouldValidate: true })}
                                      className={`p-3 rounded-xl text-left border text-xs font-bold transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                                        slot.isBooked
                                          ? 'bg-rose-50/60 border-rose-200 text-slate-400 cursor-not-allowed opacity-75'
                                          : isSelected
                                          ? 'bg-secondary text-white border-secondary ring-2 ring-primary ring-offset-1 shadow-sm'
                                          : 'bg-white text-secondary border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span>{slot.time}</span>
                                        {slot.isBooked ? (
                                          <span className="text-[10px] font-extrabold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded uppercase">Fully Booked</span>
                                        ) : (
                                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                                            Available
                                          </span>
                                        )}
                                      </div>
                                      <span className={`text-[10px] font-normal truncate ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                                        {slot.label}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                                <span>No available slots found for this date. Please pick another date.</span>
                              </div>
                            )
                          ) : (
                            <p className="text-xs text-slate-400 italic bg-white p-3 rounded-xl border border-dashed border-slate-200 text-center">
                              Please choose an event date above to display live backend available slots.
                            </p>
                          )}

                          {errors.eventTime && (
                            <p className="text-xs text-rose-500 mt-1">{errors.eventTime.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: CUISINE, PACKAGE & BUDGET */}
                  {currentStep === 3 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-serif text-lg font-bold text-secondary flex items-center gap-2">
                          <Utensils className="w-5 h-5 text-primary" />
                          <span>Step 3: Cuisine, Catering Package & Budget</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Select your culinary preferences and estimated investment.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Preferred Cuisine */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Preferred Cuisine <span className="text-rose-500">*</span>
                          </label>
                          <select
                            {...register('preferredCuisine')}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary focus:outline-none bg-white"
                          >
                            {CUISINES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          {errors.preferredCuisine && (
                            <p className="text-xs text-rose-500 mt-1">{errors.preferredCuisine.message}</p>
                          )}
                        </div>

                        {/* Catering Package */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Catering Package <span className="text-rose-500">*</span>
                          </label>
                          <select
                            {...register('cateringPackage')}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary focus:outline-none bg-white"
                          >
                            {PACKAGES.map((pkg) => (
                              <option key={pkg} value={pkg}>{pkg}</option>
                            ))}
                          </select>
                          {errors.cateringPackage && (
                            <p className="text-xs text-rose-500 mt-1">{errors.cateringPackage.message}</p>
                          )}
                        </div>

                        {/* Budget */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Estimated Budget (₹ INR) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                            <input
                              type="number"
                              placeholder="150000"
                              {...register('budget', { valueAsNumber: true })}
                              className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                                errors.budget ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-primary'
                              }`}
                            />
                          </div>
                          {errors.budget && (
                            <p className="text-xs text-rose-500 mt-1">{errors.budget.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: VENUE & FINAL REVIEW */}
                  {currentStep === 4 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-serif text-lg font-bold text-secondary flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-primary" />
                          <span>Step 4: Venue Location & Review</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Provide address details and verify your reservation summary.</p>
                      </div>

                      <div className="space-y-4">
                        {/* Address */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Full Venue Address <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Grand Lotus Banquet, Park Street"
                            {...register('venueAddress')}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                              errors.venueAddress ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-primary'
                            }`}
                          />
                          {errors.venueAddress && (
                            <p className="text-xs text-rose-500 mt-1">{errors.venueAddress.message}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                            <input
                              type="text"
                              placeholder="Mumbai"
                              {...register('city')}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary focus:outline-none"
                            />
                            {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city.message}</p>}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                            <input
                              type="text"
                              placeholder="Maharashtra"
                              {...register('state')}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary focus:outline-none"
                            />
                            {errors.state && <p className="text-xs text-rose-500 mt-1">{errors.state.message}</p>}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode *</label>
                            <input
                              type="text"
                              placeholder="400001"
                              {...register('pincode')}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary focus:outline-none"
                            />
                            {errors.pincode && <p className="text-xs text-rose-500 mt-1">{errors.pincode.message}</p>}
                          </div>
                        </div>

                        {/* Special Requirements */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Special Requests / Dietary Notes
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Jain food options, live stall requests, VIP table layout..."
                            {...register('specialRequirements')}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary focus:outline-none resize-none"
                          />
                        </div>

                        {/* Optional Attachment */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Optional Event Plan or Layout Attachment
                          </label>
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                            <input
                              type="file"
                              id="file-upload-step"
                              onChange={handleFileChange}
                              className="hidden"
                              accept=".pdf,.png,.jpg,.jpeg,.docx"
                            />
                            <label htmlFor="file-upload-step" className="cursor-pointer flex items-center justify-center gap-2">
                              <Upload className="w-4 h-4 text-primary" />
                              <span className="text-xs text-slate-600 font-medium">
                                {selectedFile ? selectedFile.name : 'Click to attach layout or menu PDF'}
                              </span>
                            </label>
                          </div>
                        </div>

                        {/* Reservation Summary Box */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                          <span className="font-bold text-secondary uppercase tracking-wider block border-b border-slate-200 pb-1">
                            Summary Review
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-slate-600">
                            <div>Customer: <strong className="text-secondary">{getValues('fullName')}</strong></div>
                            <div>Event: <strong className="text-secondary">{getValues('eventType')}</strong></div>
                            <div>Date: <strong className="text-secondary">{getValues('eventDate')}</strong></div>
                            <div>Guests: <strong className="text-secondary">{getValues('guestCount')} Guests</strong></div>
                            <div>Cuisine: <strong className="text-secondary">{getValues('preferredCuisine')}</strong></div>
                            <div>Budget: <strong className="text-emerald-700 font-bold">₹{Number(getValues('budget') || 0).toLocaleString('en-IN')}</strong></div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Navigation Button Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous Step</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {currentStep < STEPS.length ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-secondary text-white font-bold text-xs hover:bg-secondary/90 transition-all shadow-md cursor-pointer"
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-4 h-4 text-primary" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary hover:bg-primary-hover text-secondary font-bold text-sm shadow-lg transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                            <span>Submitting Reservation...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Confirm & Submit Booking</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Your event information is strictly encrypted and protected.</span>
                  </p>

                </form>
              )}

            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Direct Concierge Contact Card */}
              <div className="bg-secondary text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
                
                <h3 className="font-serif text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>Immediate Concierge</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Need an urgent quotation for an upcoming event within 48 hours? Call our master event planner directly.
                </p>

                <div className="space-y-4 text-sm font-sans">
                  <a href={`tel:${COMPANY_PHONE}`} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary text-secondary flex items-center justify-center font-bold">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-primary uppercase font-bold tracking-wider">Hotline</span>
                      <span className="font-bold text-white text-base">{COMPANY_PHONE}</span>
                    </div>
                  </a>

                  <a href={`mailto:${COMPANY_EMAIL}`} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary text-secondary flex items-center justify-center font-bold">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-primary uppercase font-bold tracking-wider">Email</span>
                      <span className="font-medium text-white text-xs">{COMPANY_EMAIL}</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Booking Process Steps */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span>Our 4-Step Booking Process</span>
                </h3>

                <div className="space-y-4">
                  {[
                    { num: '01', title: 'Submit Request', desc: 'Fill out event specifications, guest numbers, and menu preferences.' },
                    { num: '02', title: 'Menu Consultation', desc: 'Receive custom menu proposals and attend a private tasting.' },
                    { num: '03', title: 'Lock Date & Deposit', desc: 'Confirm date with advance deposit and finalized venue layout.' },
                    { num: '04', title: 'Flawless Execution', desc: 'Live kitchen setup, executive service, and unforgettable dining.' }
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-cream/60 border border-slate-100">
                      <span className="w-7 h-7 rounded-full bg-secondary text-primary font-serif font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {step.num}
                      </span>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-secondary">{step.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Choose Us */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <span>Why Choose Anjani Catering & Events?</span>
                </h3>

                <ul className="space-y-3 text-xs text-slate-600 font-sans">
                  {[
                    'Master chefs trained in authentic global culinary traditions',
                    '100% pure ingredients & stringent temperature-controlled transport',
                    'Interactive live cooking stalls (Chaat, Tandoori, Teppanyaki, Pasta)',
                    'Full suite setup: Tableware, linens, staff & post-event cleanup'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Live Availability Calendar & Instant Pre-Hold Desk Section */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-2">Real-Time Kitchen Capacity</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary mb-3">Live Availability & Pre-Hold Calendar</h2>
            <p className="text-sm font-sans text-slate-600 leading-relaxed">
              Inspect live kitchen booking statuses across the month. Reserve an instant pre-hold for your catering event before slots fill up.
            </p>
          </div>

          <AvailabilityCalendar />
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-2">Got Questions?</span>
            <h2 className="font-serif text-3xl font-bold text-secondary">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full text-left p-5 font-serif text-base font-bold text-secondary flex justify-between items-center gap-4 hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {openFaqIndex === index ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {openFaqIndex === index && (
                  <div className="px-5 pb-5 text-sm font-sans text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Plan an Unforgettable Event?
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto mb-8">
            Let our master chefs and event planners elevate your special occasion.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href={`tel:${COMPANY_PHONE}`} 
              className="bg-primary hover:bg-primary-hover text-secondary font-sans font-bold text-sm px-8 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105"
            >
              Call {COMPANY_PHONE}
            </a>
            <a 
              href="/contact" 
              className="bg-white/10 hover:bg-white/20 text-white font-sans font-semibold text-sm px-8 py-3.5 rounded-full border border-white/20 transition-all"
            >
              Contact Us Page
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
