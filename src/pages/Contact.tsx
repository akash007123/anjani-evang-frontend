import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import PageBanner from '../components/layout/PageBanner';
import SEO from '../components/SEO';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { COMPANY_ADDRESS, COMPANY_PHONE, COMPANY_EMAIL, COMPANY_NAME } from '../config/env';

// Contact form validation schema using Zod
const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(6, { message: 'Please enter a valid phone number.' }),
  eventDate: z.string().optional(),
  guests: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
    { message: 'Guest count must be a positive number.' }
  ),
  message: z.string().min(10, { message: 'Event summary must be at least 10 characters.' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const { language, t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      eventDate: '',
      guests: '',
      message: ''
    }
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);

    try {
      const result = await api.submitContact({
        name: data.name,
        email: data.email,
        phone: data.phone,
        eventDate: data.eventDate || undefined,
        guestCount: data.guests ? Number(data.guests) : undefined,
        message: data.message,
      });
      if (result.success) {
        const ref = result.data?.reference;
        toast.success(
          ref
            ? `Thank you! Your inquiry (Ref ${ref}) has been received. Our planner will contact you shortly.`
            : "Thank you! Your catering inquiry has been received. Our planner will contact you shortly.",
          "Inquiry Sent!"
        );
        reset();
      } else {
        toast.error(
          result.error || "We couldn't send your inquiry. Please try again or call us.",
          "Something went wrong"
        );
      }
    } catch (apiErr) {
      console.error("Backend contact form submission failed:", apiErr);
      toast.error("We couldn't send your inquiry. Please try again or call us.", "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <SEO 
        title="Contact Us | Anjani Catering & Events - Chhatarpur, MP" 
        description="Contact Anjani Catering & Events for wedding and event catering in Chhatarpur, Madhya Pradesh. Request a free quote, customize your menu, and plan your celebration with our team."
        urlPath="/contact"
      />
      <PageBanner 
        title="Contact Us" 
        breadcrumbs={[{ name: 'Contact' }]} 
        backgroundImage="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80"
      />

      {/* Main Contact Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* LEFT COLUMN - Information Cards - 5 Columns */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-left">
              
              <div>
                <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block mb-2">
                  GET IN TOUCH
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary mb-4 leading-tight">
                  Let's Plan Your Celebration
                </h2>
                <p className="font-sans text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                  We would love to hear about your event. Whether it's a wedding, reception, birthday, or corporate gathering, our team is here to help. Drop us a message or give us a call.
                </p>
              </div>

              {/* Contact Cards List */}
              <div className="grid grid-cols-1 gap-4 font-sans text-xs sm:text-sm text-slate-700 font-semibold">
                
                {/* 1. Office Location */}
                <div className="bg-white rounded-2xl p-5 border border-slate-50 shadow-sm flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-secondary mb-1">Our Location</h4>
                    <p className="text-slate-500 font-medium">{COMPANY_ADDRESS}</p>
                  </div>
                </div>

                {/* 2. Phone Lines */}
                <div className="bg-white rounded-2xl p-5 border border-slate-50 shadow-sm flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-secondary mb-1">Call Us</h4>
                    <p className="text-slate-500 font-medium">{COMPANY_PHONE} (Inquiries)</p>
                  </div>
                </div>

                {/* 3. Emails coordinates */}
                <div className="bg-white rounded-2xl p-5 border border-slate-50 shadow-sm flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-secondary mb-1">Email Us</h4>
                      <p className="text-slate-500 font-medium">{COMPANY_EMAIL}</p>
                    </div>
                </div>

                {/* 4. Business Hours */}
                <div className="bg-white rounded-2xl p-5 border border-slate-50 shadow-sm flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-secondary mb-1">Operations Hours</h4>
                    <p className="text-slate-500 font-medium">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                    <p className="text-slate-500 font-medium">Sunday: Closed (Event execution only)</p>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN - Form - 7 Columns */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-lg text-left relative">
                
                <h3 className="font-serif text-2xl font-bold text-secondary mb-2">
                  Send Us Your Inquiry
                </h3>
                <p className="font-sans text-slate-500 text-xs sm:text-sm mb-8 font-medium">
                  Tell us about your event and we will get back to you with a customized catering plan and quote.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Rahul Sharma"
                        className={`w-full bg-cream border rounded-xl py-3 px-4 text-xs sm:text-sm focus:outline-none focus:border-primary text-secondary font-sans font-medium transition-colors ${
                          errors.name ? 'border-red-400 focus:border-red-500' : 'border-slate-100'
                        }`}
                        {...register('name')}
                      />
                      {errors.name && (
                        <span className="text-red-500 font-sans text-[11px] font-semibold">
                          {errors.name.message}
                        </span>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="rahul@example.com"
                        className={`w-full bg-cream border rounded-xl py-3 px-4 text-xs sm:text-sm focus:outline-none focus:border-primary text-secondary font-sans font-medium transition-colors ${
                          errors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-100'
                        }`}
                        {...register('email')}
                      />
                      {errors.email && (
                        <span className="text-red-500 font-sans text-[11px] font-semibold">
                          {errors.email.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91-9685533878"
                        className={`w-full bg-cream border rounded-xl py-3 px-4 text-xs sm:text-sm focus:outline-none focus:border-primary text-secondary font-sans font-medium transition-colors ${
                          errors.phone ? 'border-red-400 focus:border-red-500' : 'border-slate-100'
                        }`}
                        {...register('phone')}
                      />
                      {errors.phone && (
                        <span className="text-red-500 font-sans text-[11px] font-semibold">
                          {errors.phone.message}
                        </span>
                      )}
                    </div>

                    {/* Event Date */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Target Event Date
                      </label>
                      <input
                        type="date"
                        className={`w-full bg-cream border rounded-xl py-3 px-4 text-xs sm:text-sm focus:outline-none focus:border-primary text-secondary font-sans font-medium transition-colors ${
                          errors.eventDate ? 'border-red-400 focus:border-red-500' : 'border-slate-100'
                        }`}
                        {...register('eventDate')}
                      />
                      {errors.eventDate && (
                        <span className="text-red-500 font-sans text-[11px] font-semibold">
                          {errors.eventDate.message}
                        </span>
                      )}
                    </div>

                    {/* Guest Count */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Guest Count
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 150"
                        className={`w-full bg-cream border rounded-xl py-3 px-4 text-xs sm:text-sm focus:outline-none focus:border-primary text-secondary font-sans font-medium transition-colors ${
                          errors.guests ? 'border-red-400 focus:border-red-500' : 'border-slate-100'
                        }`}
                        {...register('guests')}
                      />
                      {errors.guests && (
                        <span className="text-red-500 font-sans text-[11px] font-semibold">
                          {errors.guests.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-secondary">
                      Event Summary & Dietary Requests *
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Tell us about your event, menu preferences, guest count, and any special requests..."
                      className={`w-full bg-cream border rounded-xl py-3 px-4 text-xs sm:text-sm focus:outline-none focus:border-primary text-secondary font-sans font-medium transition-colors ${
                        errors.message ? 'border-red-400 focus:border-red-500' : 'border-slate-100'
                      }`}
                      {...register('message')}
                    />
                    {errors.message && (
                      <span className="text-red-500 font-sans text-[11px] font-semibold">
                        {errors.message.message}
                      </span>
                    )}
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-secondary font-sans font-bold py-4 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Inquiry</span>
                      </>
                    )}
                  </button>

                </form>
              </div>
            </div>

          </div>

          {/* GOOGLE MAPS PLACEHOLDER WIDGET */}
          <div className="mt-20 rounded-3xl overflow-hidden border border-slate-100 shadow-lg h-[400px] relative group bg-linen">
            <div 
              className="absolute inset-0 bg-cover bg-center filter grayscale opacity-45 brightness-95"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80')` }}
            />
            {/* Elegant luxury overlay layout detailing the address coordinates */}
            <div className="absolute inset-0 bg-secondary/80 flex flex-col items-center justify-center p-4">
              <div className="bg-white text-secondary rounded-2xl p-6 sm:p-8 max-w-sm text-center shadow-2xl relative z-10 border border-slate-100 animate-fade-in flex flex-col gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto">
                  <MapPin className="w-6 h-6 animate-bounce" />
                </div>
                <h4 className="font-serif text-lg font-bold">{COMPANY_NAME}</h4>
                <p className="font-sans text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Chhatarpur, <br /> Madhya Pradesh 471001, India
                </p>
                <div className="border-t border-slate-50 pt-3 mt-1 flex justify-between text-[11px] text-slate-400 font-sans font-semibold">
                  <span>Serving Chhatarpur & All MP</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
