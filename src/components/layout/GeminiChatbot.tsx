import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, X, Send, Bot, User, Trash2, ArrowRight, Copy, Check, Calendar, 
  Users, DollarSign, MapPin, ClipboardList, RefreshCw, MessageSquare, Volume2, VolumeX
} from "lucide-react";
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../lib/api";

interface Message {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: Date;
  isBookingForm?: boolean;
}

interface BookingFormData {
  name: string;
  mobile: string;
  email: string;
  eventType: string;
  eventDate: string;
  guests: string;
  preferredCuisine: string;
  cateringPackage: string;
  budget: string;
  venueAddress: string;
  city: string;
  specialRequirements: string;
}

export default function GeminiChatbot() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem("eveng_chatbot_muted") === "true";
    } catch (_) {
      return false;
    }
  });

  // Booking Form State
  const [showFormInChat, setShowFormInChat] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    mobile: "",
    email: "",
    eventType: "Wedding",
    eventDate: "",
    guests: "",
    preferredCuisine: "",
    cateringPackage: "Royal Heritage Buffet",
    budget: "",
    venueAddress: "",
    city: "Mumbai",
    specialRequirements: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompts matching luxury catering themes
  const suggestions = [
    "Book an Event / Get Quote 📅",
    "Suggest a royal wedding menu",
    "What is your Saffron Dum Biryani?",
    "Can you handle Jain or vegan requests?",
    "Catering packages & pricing"
  ];

  // Initialize Session ID and chat logs on mount
  useEffect(() => {
    // Generate or retrieve session ID
    let sId = sessionStorage.getItem("eveng_chatbot_session_id");
    if (!sId) {
      sId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("eveng_chatbot_session_id", sId);
    }
    setSessionId(sId);

    // Hydrate chat from local storage if available
    const saved = localStorage.getItem(`eveng_chat_history_${sId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hydrated = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(hydrated);
        if (hydrated.length > 0) {
          setShowNotification(false);
        }
      } catch (e) {
        console.error("Error hydrating chatbot history:", e);
      }
    } else {
      // Set default high-fidelity welcome message
      const welcome: Message = {
        id: "welcome-msg",
        role: "model",
        content: "Namaste! 🙏 Welcome to Anjani Catering & Events's digital lounge. I'm your AI Culinary Concierge and Banquet Planner.\n\nI can assist you with planning wedding catering, corporate gala dinners, birthday parties, customized menu designs, regional Indian cuisines, pricing, and reservation booking.\n\nHow may I help you craft the perfect celebration today?",
        timestamp: new Date(),
      };
      setMessages([welcome]);
    }
  }, []);

  // Save chat to local storage whenever message thread updates
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      localStorage.setItem(`eveng_chat_history_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  // Scroll to bottom when new messages/loading triggers
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen, showFormInChat]);

  // Simple, robust markdown bold/emoji parser to display rich text beautifully without heavy packages
  const parseMarkdown = (text: string) => {
    if (!text) return "";
    
    // Convert line breaks
    let html = text.replace(/\n/g, "<br />");
    
    // Bold parsing (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    
    // Bullet points conversion
    html = html.replace(/^\*\s(.*)/gm, '<span class="inline-block mr-1.5">•</span> $1');
    
    return <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
  };

  // Detect booking/quoting intent from input texts
  const checkBookingIntent = (text: string): boolean => {
    const keywords = [
      "book", "booking", "reserve", "reservation", "quotation", "quote", 
      "order", "price estimate", "need food", "catering request", "hire", "pricing"
    ];
    const lowercaseText = text.toLowerCase();
    return keywords.some(keyword => lowercaseText.includes(keyword));
  };

  const getLocalResponse = (promptText: string): string => {
    const text = promptText.toLowerCase();

    if (text.includes("menu") || text.includes("saffron") || text.includes("biryani") || text.includes("dish") || text.includes("specialty") || text.includes("cuisines") || text.includes("food") || text.includes("eat")) {
      return "Our signature offering is the **Saffron Dum Biryani**—infused with pure Kashmiri Saffron, slow-steamed in traditional copper degs, and layered with aged Basmati rice. We also curate high-end Mughlai, Awadhi heritage menus, gourmet live counters (artisanal chaat, wood-fired naan sliders), and premium Pan-Asian or Mediterranean fusions.";
    }

    if (text.includes("jain") || text.includes("vegan") || text.includes("veg") || text.includes("dietary") || text.includes("onion") || text.includes("garlic")) {
      return "Yes, absolutely! We take immense pride in crafting exceptional **Strictly Jain, Vegan, and Satvik delicacies**. We operate separate, fully segregated kitchen sections and dedicated utensils to ensure complete purity (no onion, garlic, or root vegetables), maintaining the highest standards of fine-dining flavor.";
    }

    if (text.includes("package") || text.includes("pricing") || text.includes("cost") || text.includes("rate") || text.includes("price") || text.includes("silver") || text.includes("gold") || text.includes("platinum")) {
      return "Our curated banquet structures are designed for sheer luxury:\n\n* **Shehnai Silver Banquet**: An elegant traditional menu showcasing celebrated Indian classics.\n* **Royal Heritage Buffet**: An elaborate multi-course feast with live interactive cooking salons.\n* **Maharaja Platinum Seated**: Our absolute gold-standard custom silver-service pre-plated culinary theater.\n\nTo provide an exact quote, pricing varies based on custom recipes, venue, and guest counts. Click **'Book Event / Get Quote 📅'** or let me know your guest count to prepare a tailored estimate!";
    }

    if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("welcome") || text.includes("namaste") || text.includes("greet")) {
      return "Namaste! 🙏 I am your AI Culinary Concierge. I can help you explore our award-winning menu catalogs, design custom Jain or royal menus, calculate banquet estimates, and book dates for your upcoming celebration. What style of catering can I inspire you with today?";
    }

    // Default polite response guiding them to the form
    return "I would be delighted to assist you with planning this beautiful celebration! At Anjani Catering & Events, we deliver exquisite culinary curations for weddings, corporate events, and grand galas.\n\nWould you like me to open our **Custom Banquet Request Form** right here in our chat to record your details for a personalized quote, or would you like to know more about our **Gourmet Menus**?";
  };

  const playNotificationSound = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // First note (subtle high note, warm sine)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(783.99, ctx.currentTime); // G5 note
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.4);

      // Second note (major interval, C6 note)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.08); // C6 note
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.08);
      gain2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.5);
    } catch (err) {
      console.warn("Audio Context playback failed or blocked by autoplay policy", err);
    }
  };

  const saveLocalSessionMessage = (role: "user" | "model", content: string) => {
    try {
      const savedSessionsStr = localStorage.getItem("eveng_local_sessions");
      const savedSessions: any[] = savedSessionsStr ? JSON.parse(savedSessionsStr) : [];
      
      let session = savedSessions.find(s => s.sessionId === sessionId);
      if (!session) {
        session = {
          id: `local-sess-${Date.now()}`,
          sessionId,
          clientName: formData.name || undefined,
          messages: [],
          bookingCreated: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        savedSessions.push(session);
      }
      
      session.messages.push({
        role,
        content,
        timestamp: new Date().toISOString()
      });
      session.updatedAt = new Date().toISOString();
      if (formData.name) {
        session.clientName = formData.name;
      }
      
      localStorage.setItem("eveng_local_sessions", JSON.stringify(savedSessions));
    } catch (e) {
      console.error("Error saving local session:", e);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Remove notification badge on first interaction
    setShowNotification(false);

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    // Save user message to local session database
    saveLocalSessionMessage("user", text.trim());

    // If user clicked "Book an Event" or expressed explicit booking form request, trigger form
    if (text.includes("Book an Event") || text.includes("Get Quote 📅") || checkBookingIntent(text)) {
      setTimeout(() => {
        setIsLoading(false);
        const botAcknowledge: Message = {
          id: `msg-${Date.now()}-bot-form-intro`,
          role: "model",
          content: "I'd be absolutely delighted to assist you with booking your celebration or preparing a customized price quotation! 🌟\n\nPlease fill out this secure event banquet form right here in our chat, and our culinary event director will get back to you with a tailor-made proposal within 2 hours.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botAcknowledge]);
        saveLocalSessionMessage("model", botAcknowledge.content);
        playNotificationSound();
        setShowFormInChat(true);
      }, 700);
      return;
    }

    try {
      // Gather history payload for Gemini backend API
      const payloadMessages = [...messages, userMsg]
        .filter(m => !m.isBookingForm && m.role !== "system")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      let responseText = "";

      try {
        const result = await api.sendGeminiChat({
          messages: payloadMessages,
          sessionId,
          clientName: formData.name || undefined
        });

        if (result.success && result.data) {
          responseText = result.data.response;
        } else {
          throw new Error("Failure contacting backend API");
        }
      } catch (apiErr) {
        console.warn("Backend Gemini API unavailable/error. Falling back to luxury client-side local simulator.", apiErr);
        responseText = getLocalResponse(text.trim());
      }
      
      const modelMsg: Message = {
        id: `msg-${Date.now()}-model`,
        role: "model",
        content: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, modelMsg]);
      playNotificationSound();

      // Save model message to local session database
      saveLocalSessionMessage("model", responseText);

      // If response indicated intent to collect details, double-trigger form offer
      if (responseText.toLowerCase().includes("inquiry form") || responseText.toLowerCase().includes("collect your details") || responseText.toLowerCase().includes("banquet request form")) {
        setTimeout(() => {
          setShowFormInChat(true);
        }, 1200);
      }

    } catch (err: any) {
      console.error(err);
      const errMsg: Message = {
        id: `msg-${Date.now()}-error`,
        role: "model",
        content: "My apologies, but my connection is temporarily unstable. Please check your network, or click our floating WhatsApp widget to connect directly with our human representatives for prompt hospitality!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
      playNotificationSound();
    } finally {
      setIsLoading(false);
    }
  };

  // Form Field validation logic
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof BookingFormData, string>> = {};
    
    if (!formData.name.trim()) errors.name = "Full Name is required";
    
    // Indian mobile phone regex (starts with +91, 91, or just 10 digits starting with 6-9)
    const mobileRegex = /^(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}$/;
    if (!formData.mobile.trim()) {
      errors.mobile = "Mobile Number is required";
    } else if (!mobileRegex.test(formData.mobile.replace(/\s/g, ""))) {
      errors.mobile = "Please enter a valid 10-digit Indian mobile number";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email Address is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.eventDate) {
      errors.eventDate = "Event Date is required";
    } else {
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.eventDate = "Event Date must be in the future";
      }
    }

    const guestsNum = parseInt(formData.guests, 10);
    if (!formData.guests) {
      errors.guests = "Guest count is required";
    } else if (isNaN(guestsNum) || guestsNum <= 0) {
      errors.guests = "Guest count must be greater than 0";
    }

    const budgetNum = parseFloat(formData.budget);
    if (!formData.budget) {
      errors.budget = "Approx budget is required";
    } else if (isNaN(budgetNum) || budgetNum <= 0) {
      errors.budget = "Budget must be a positive number";
    }

    if (!formData.venueAddress.trim()) errors.venueAddress = "Venue address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.preferredCuisine.trim()) errors.preferredCuisine = "Cuisine preference is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmittingForm(true);

    const payload = {
      id: `local-booking-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      eventType: formData.eventType,
      eventDate: formData.eventDate,
      guests: parseInt(formData.guests, 10),
      preferredCuisine: formData.preferredCuisine,
      cateringPackage: formData.cateringPackage,
      budget: parseFloat(formData.budget),
      venueAddress: formData.venueAddress,
      city: formData.city,
      specialRequirements: formData.specialRequirements,
      status: "New Inquiry",
      source: "Chatbot Form",
      createdAt: new Date().toISOString()
    };

    // 1. Send to the backend API first
    try {
      await api.submitChatBooking({
        sessionId,
        ...payload
      });
    } catch (err) {
      console.warn("Backend database API down. Storing exclusivamente to local localStorage fallback.", err);
    }

    // 2. Always save to Local Storage as double-persistence fallback
    try {
      const savedBookingsStr = localStorage.getItem("eveng_local_bookings");
      const savedBookings = savedBookingsStr ? JSON.parse(savedBookingsStr) : [];
      savedBookings.unshift(payload);
      localStorage.setItem("eveng_local_bookings", JSON.stringify(savedBookings));

      // Mark local session as "booking created"
      const savedSessionsStr = localStorage.getItem("eveng_local_sessions");
      if (savedSessionsStr) {
        const savedSessions = JSON.parse(savedSessionsStr);
        const session = savedSessions.find((s: any) => s.sessionId === sessionId);
        if (session) {
          session.bookingCreated = true;
          session.clientName = formData.name;
          session.messages.push({
            role: "model",
            content: `*[System Notification: Booking Request submitted successfully via Chatbot Form. Contact Name: ${formData.name}, Event: ${formData.eventType} on ${formData.eventDate} for ${formData.guests} guests. Budget: ₹${formData.budget}]*`,
            timestamp: new Date().toISOString()
          });
          session.updatedAt = new Date().toISOString();
          localStorage.setItem("eveng_local_sessions", JSON.stringify(savedSessions));
        }
      }
    } catch (e) {
      console.error("Local storage booking save error:", e);
    }

    setFormSuccess(true);
    
    // Add success response from bot directly to flow
    setTimeout(() => {
      const successMessage: Message = {
        id: `msg-${Date.now()}-booking-success`,
        role: "model",
        content: `🎉 **Booking Inquiry Placed Successfully!**\n\nThank you, **${formData.name}**! Your request for your **${formData.eventType}** on **${formData.eventDate}** has been secured in our system.\n\nOur catering manager will reach out to you shortly at **${formData.mobile}** with a customized menu plan. Feel free to keep chatting with me for further queries!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
      saveLocalSessionMessage("model", successMessage.content);
      playNotificationSound();
      setShowFormInChat(false);
      setIsSubmittingForm(false);
    }, 1500);
  };

  // Utility Actions
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm("Would you like to clear our conversation and start fresh?")) {
      const welcome: Message = {
        id: "welcome-msg",
        role: "model",
        content: "Namaste! 🙏 Welcome back. I'm your AI Culinary Concierge. How may I assist you with planning your menu packages, wedding banquets, or live catering stations today?",
        timestamp: new Date(),
      };
      setMessages([welcome]);
      setShowFormInChat(false);
      setFormSuccess(false);
      localStorage.removeItem(`eveng_chat_history_${sessionId}`);
    }
  };

  const handleRestartConversation = () => {
    const newSessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("eveng_chatbot_session_id", newSessionId);
    setSessionId(newSessionId);
    
    const welcome: Message = {
      id: "welcome-msg",
      role: "model",
      content: "Namaste! 🙏 I've initialized a fresh, new session for you. I am your AI Banquet Consultant. Ask me anything about our regional Indian specialties, royal dinner stations, or booking capacities!",
      timestamp: new Date(),
    };
    setMessages([welcome]);
    setShowFormInChat(false);
    setFormSuccess(false);
    setFormData({
      name: "",
      mobile: "",
      email: "",
      eventType: "Wedding",
      eventDate: "",
      guests: "",
      preferredCuisine: "",
      cateringPackage: "Royal Heritage Buffet",
      budget: "",
      venueAddress: "",
      city: "Mumbai",
      specialRequirements: "",
    });
  };

  return (
    <div id="gemini-chatbot-container" className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none print:hidden">
      
      {/* Dynamic Chat Dialog Screen */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-[350px] sm:w-[420px] h-[550px] sm:h-[620px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden pointer-events-auto flex flex-col md:max-h-[85vh] max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:rounded-none"
          >
            {/* Header: Royal Theme Brand Banner */}
            <div className="bg-gradient-to-r from-secondary to-[#162f1f] text-white p-4 flex items-center justify-between border-b border-primary/25 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <Sparkles className="w-5.5 h-5.5 text-primary" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-[#122418] animate-pulse" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-serif text-sm font-bold tracking-wide text-white">{t('chatbot:headerTitle')}</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    <span className="text-[9px] text-primary/90 font-sans font-extrabold tracking-widest uppercase">{t('chatbot:onlineStatus')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsMuted(prev => {
                    const newMute = !prev;
                    localStorage.setItem("eveng_chatbot_muted", String(newMute));
                    return newMute;
                  })}
                  className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                  title={isMuted ? "Unmute Sound Notifications" : "Mute Sound Notifications"}
                  aria-label={isMuted ? "Unmute Sound Notifications" : "Mute Sound Notifications"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleRestartConversation}
                  className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                  title="New Conversation Session"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {messages.length > 1 && (
                  <button
                    onClick={handleClearChat}
                    className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                    title="Clear Conversation History"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer max-sm:p-2.5"
                  aria-label="Close Chat Window"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>
            </div>

            {/* Message Stream Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                const isSystem = msg.role === "system";
                
                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center py-2">
                      <span className="inline-block px-3 py-1 bg-emerald-50 text-[10px] font-bold text-emerald-800 rounded-lg border border-emerald-100">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 max-w-[88%] ${
                      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {/* Avatar Icon */}
                    <div
                      className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center border text-[10px] font-bold ${
                        isUser
                          ? "bg-primary/15 border-primary/25 text-secondary"
                          : "bg-secondary text-primary border-primary/25"
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4 text-secondary" /> : <Bot className="w-4 h-4 text-primary" />}
                    </div>

                    {/* Chat Bubble Context */}
                    <div className="flex flex-col gap-1 text-left relative group/bubble">
                      <div
                        className={`p-3 rounded-2xl text-[12.5px] font-sans leading-relaxed shadow-xs whitespace-pre-wrap ${
                          isUser
                            ? "bg-secondary text-white rounded-tr-none font-medium"
                            : "bg-white text-slate-800 rounded-tl-none border border-slate-100 font-medium"
                        }`}
                      >
                        {parseMarkdown(msg.content)}
                      </div>
                      
                      <div className="flex items-center gap-2 px-1 justify-between">
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        {/* Copy button available on hover */}
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="opacity-0 group-hover/bubble:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-secondary rounded-sm cursor-pointer"
                          title="Copy Message Text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* EMBEDDED INTERACTIVE FORM INLINE CHAT FLOW */}
              {showFormInChat && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border-2 border-primary/30 p-4 space-y-4 shadow-xl text-left"
                >
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <Calendar className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <h4 className="font-serif text-sm font-bold text-secondary">Custom Banquet Request Form</h4>
                      <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Secure Booking • Instant Dispatch</p>
                    </div>
                  </div>

                  {formSuccess ? (
                    <motion.div 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="text-center py-6 space-y-3"
                    >
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-7 h-7 stroke-[3px]" />
                      </div>
                      <div>
                        <p className="font-serif text-sm font-bold text-secondary">Inquiry Secured!</p>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Your catering coordinates were dispatched.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-3.5 font-sans text-xs">
                      {/* Grid Field layout */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Name */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Full Name *</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Rahul Sharma"
                            className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${formErrors.name ? "border-rose-400" : "border-slate-100"}`}
                          />
                          {formErrors.name && <span className="text-[9px] text-rose-500 font-bold">{formErrors.name}</span>}
                        </div>

                        {/* Mobile */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Mobile Number *</label>
                          <input
                            type="tel"
                            value={formData.mobile}
                            onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                            placeholder="e.g. 9685533878"
                            className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${formErrors.mobile ? "border-rose-400" : "border-slate-100"}`}
                          />
                          {formErrors.mobile && <span className="text-[9px] text-rose-500 font-bold">{formErrors.mobile}</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Email */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Email Address *</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="e.g. rahul@example.com"
                            className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${formErrors.email ? "border-rose-400" : "border-slate-100"}`}
                          />
                          {formErrors.email && <span className="text-[9px] text-rose-500 font-bold">{formErrors.email}</span>}
                        </div>

                        {/* Event Type */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Event Type *</label>
                          <select
                            value={formData.eventType}
                            onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                            className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:bg-white"
                          >
                            <option value="Wedding">Wedding Catering</option>
                            <option value="Birthday">Birthday Celebration</option>
                            <option value="Corporate">Corporate Gala</option>
                            <option value="Anniversary">Anniversary</option>
                            <option value="Sangeet/Cocktail">Sangeet & Cocktails</option>
                            <option value="Housewarming">Housewarming</option>
                            <option value="Festival">Festival Celebration</option>
                            <option value="Other Celebrations">Other Celebrations</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Event Date */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Event Date *</label>
                          <input
                            type="date"
                            value={formData.eventDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                            className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${formErrors.eventDate ? "border-rose-400" : "border-slate-100"}`}
                          />
                          {formErrors.eventDate && <span className="text-[9px] text-rose-500 font-bold">{formErrors.eventDate}</span>}
                        </div>

                        {/* Guests count */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Number of Guests *</label>
                          <div className="relative">
                            <Users className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="number"
                              value={formData.guests}
                              onChange={(e) => setFormData(prev => ({ ...prev, guests: e.target.value }))}
                              placeholder="e.g. 150"
                              className={`w-full pl-8 pr-2 p-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${formErrors.guests ? "border-rose-400" : "border-slate-100"}`}
                            />
                          </div>
                          {formErrors.guests && <span className="text-[9px] text-rose-500 font-bold">{formErrors.guests}</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Preferred Cuisine */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Cuisine Preference *</label>
                          <input
                            type="text"
                            value={formData.preferredCuisine}
                            onChange={(e) => setFormData(prev => ({ ...prev, preferredCuisine: e.target.value }))}
                            placeholder="e.g. Mughlai, Jain Buffet, fusion"
                            className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${formErrors.preferredCuisine ? "border-rose-400" : "border-slate-100"}`}
                          />
                          {formErrors.preferredCuisine && <span className="text-[9px] text-rose-500 font-bold">{formErrors.preferredCuisine}</span>}
                        </div>

                        {/* Package Selection */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Catering Package</label>
                          <select
                            value={formData.cateringPackage}
                            onChange={(e) => setFormData(prev => ({ ...prev, cateringPackage: e.target.value }))}
                            className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:bg-white"
                          >
                            <option value="Royal Heritage Buffet">Royal Heritage Buffet (₹₹)</option>
                            <option value="Shehnai Silver Banquet">Shehnai Silver Banquet (₹)</option>
                            <option value="Maharaja Platinum Seated">Maharaja Platinum Seated (₹₹₹)</option>
                            <option value="Custom Bespoke Layout">Bespoke Custom Plan (TBD)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Budget */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Preferred Budget (₹) *</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2.5 text-slate-400 font-extrabold text-[11px]">₹</span>
                            <input
                              type="number"
                              value={formData.budget}
                              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                              placeholder="e.g. 150000"
                              className={`w-full pl-6 pr-2 p-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${formErrors.budget ? "border-rose-400" : "border-slate-100"}`}
                            />
                          </div>
                          {formErrors.budget && <span className="text-[9px] text-rose-500 font-bold">{formErrors.budget}</span>}
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">City *</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="e.g. Mumbai"
                            className={`w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${formErrors.city ? "border-rose-400" : "border-slate-100"}`}
                          />
                          {formErrors.city && <span className="text-[9px] text-rose-500 font-bold">{formErrors.city}</span>}
                        </div>
                      </div>

                      {/* Venue Address */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Venue Address *</label>
                        <div className="relative">
                          <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={formData.venueAddress}
                            onChange={(e) => setFormData(prev => ({ ...prev, venueAddress: e.target.value }))}
                            placeholder="e.g. Taj Mahal Palace Hotel Ballroom"
                            className={`w-full pl-8 pr-2 p-2 bg-slate-50 border rounded-lg focus:outline-none focus:bg-white ${formErrors.venueAddress ? "border-rose-400" : "border-slate-100"}`}
                          />
                        </div>
                        {formErrors.venueAddress && <span className="text-[9px] text-rose-500 font-bold">{formErrors.venueAddress}</span>}
                      </div>

                      {/* Special Requirements */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Special Dietary / Decor Requirements</label>
                        <div className="relative">
                          <ClipboardList className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <textarea
                            value={formData.specialRequirements}
                            onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                            placeholder="e.g. Strictly Jain (no onion/garlic), molecular gastronomy live counter..."
                            className="w-full pl-8 pr-2 p-2 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:bg-white h-14 resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-1.5">
                        <button
                          type="button"
                          onClick={() => setShowFormInChat(false)}
                          className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all text-center cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingForm}
                          className="w-2/3 py-2.5 bg-primary hover:bg-primary-hover text-secondary font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingForm ? (
                            <>
                              <span className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                              <span>Sending Inquiry...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Inquiry</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}

              {/* Chat loader loading indicators */}
              {isLoading && (
                <div className="flex gap-2.5 max-w-[85%] mr-auto">
                  <div className="w-7 h-7 rounded-full shrink-0 bg-secondary text-primary border border-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips (only active when form is closed and AI is idle) */}
            {messages.length <= 1 && !isLoading && !showFormInChat && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 shrink-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2 px-1">
                  Suggested topics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[11px] bg-white hover:bg-slate-50 border border-slate-100 text-slate-700 font-semibold px-2.5 py-1.5 rounded-full transition-all duration-200 shadow-xs flex items-center gap-1.5 cursor-pointer hover:border-primary/40 text-left"
                    >
                      <span>{prompt}</span>
                      <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Form Entry Block */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0 max-sm:pb-6"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('chatbot:placeholder')}
                className="flex-grow bg-slate-50 border border-slate-100 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-primary/40 focus:bg-white text-slate-700 font-sans font-semibold placeholder-slate-400"
                disabled={isLoading || showFormInChat}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading || showFormInChat}
                className="w-9 h-9 rounded-full bg-primary hover:bg-primary-hover text-secondary flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100 active:scale-90 shadow-md shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4 text-secondary" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sparks Core Action Trigger */}
      <div className="relative pointer-events-auto">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setShowNotification(false);
            }
          }}
          className="w-14 h-14 rounded-full bg-secondary text-primary shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group outline-none cursor-pointer border border-primary/25"
          aria-label="Ask AI Culinary Assistant"
        >
          {/* Subtle gold pulsing halo halo */}
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "3s" }} />

          {isOpen ? (
            <X className="w-6 h-6 text-primary transition-transform duration-300 rotate-90" />
          ) : (
            <Sparkles className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
          )}

          {/* Quick notification bubble helper for first discovery */}
          {showNotification && !isOpen && (
            <span className="absolute -top-1 -right-1 bg-primary text-secondary text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              AI
            </span>
          )}
        </button>

        {/* Small floating chat discovery text bubble */}
        {showNotification && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="absolute right-16 top-2 bg-secondary text-primary border border-primary/20 shadow-lg py-1.5 px-3 rounded-xl rounded-tr-none whitespace-nowrap text-[10px] font-sans font-bold uppercase tracking-wider"
          >
            Ask AI Concierge ✨
          </motion.div>
        )}
      </div>

    </div>
  );
}
