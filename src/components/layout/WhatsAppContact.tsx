import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, ChefHat, Sparkles, Calendar, Heart } from 'lucide-react';
import { COMPANY_PHONE_RAW, COMPANY_NAME } from '../../config/env';

export default function WhatsAppContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<'general' | 'menu' | 'dietary' | 'booking'>('general');
  const [showBadge, setShowBadge] = useState(true);

  // Auto-dismiss the small notification badge when the user opens the widget
  useEffect(() => {
    if (isOpen) {
      setShowBadge(false);
    }
  }, [isOpen]);

  const cateringPhone = COMPANY_PHONE_RAW.replace(/[^0-9]/g, '');
  
  // High-end sample topics for quick selection
  const topics = [
    {
      id: 'general',
      label: 'General Inquiry',
      emoji: '✨',
      defaultText: `Hello ${COMPANY_NAME}! I would like to inquire about your professional catering services for an upcoming event.`,
      icon: Sparkles,
    },
    {
      id: 'menu',
      label: 'Menu Customization',
      emoji: '🍳',
      defaultText: 'Hi! I am looking at your packages and would love to discuss custom menu curation or tasting sessions.',
      icon: ChefHat,
    },
    {
      id: 'dietary',
      label: 'Dietary & Allergies',
      emoji: '🌱',
      defaultText: 'Hello. I have guests with specific dietary restrictions (vegan/gluten-free). How do you accommodate allergies?',
      icon: Heart,
    },
    {
      id: 'booking',
      label: 'Instant Booking Quote',
      emoji: '📅',
      defaultText: 'Greetings! I have an event date selected and would love to get a pricing quote and layout proposal.',
      icon: Calendar,
    },
  ] as const;

  const currentTopic = topics.find((t) => t.id === selectedTopic) || topics[0];
  const finalMessage = customMessage.trim() || currentTopic.defaultText;
  const whatsappUrl = `https://wa.me/${cateringPhone}?text=${encodeURIComponent(finalMessage)}`;

  return (
    <div id="whatsapp-floating-widget" className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      
      {/* Interactive Chat Popup Window */}
      {isOpen && (
        <div 
          id="whatsapp-chat-popup"
          className="w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-serif text-lg font-bold text-cream">
                  E
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-600 rounded-full animate-ping" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-600 rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-sm font-semibold tracking-wide">Anjani Concierge</span>
                <span className="text-[11px] text-emerald-100">Typically replies within 5 minutes</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Welcoming Bubble */}
          <div className="bg-slate-50 p-4 border-b border-slate-100">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-slate-700 text-xs sm:text-sm leading-relaxed">
              <p className="font-serif font-semibold text-secondary mb-1">Welcome to {COMPANY_NAME}! 👋</p>
              <p className="text-slate-500 font-sans">
                How may we help you design your dining experience today? Pick a quick topic below or type your inquiry.
              </p>
            </div>
          </div>

          {/* Topic Selectors */}
          <div className="p-4 flex flex-col gap-2.5 max-h-[160px] overflow-y-auto custom-scrollbar">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inquiry Theme</span>
            <div className="grid grid-cols-2 gap-2">
              {topics.map((t) => {
                const isSelected = selectedTopic === t.id;
                const IconComponent = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTopic(t.id);
                      setCustomMessage(''); // Clear custom message when switching categories to avoid confusion
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all border text-xs font-sans ${
                      isSelected 
                        ? 'bg-emerald-50 border-emerald-500/30 text-emerald-800 font-semibold shadow-sm' 
                        : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message preview / Input area */}
          <div className="p-4 pt-0">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                <span>Message Draft</span>
                {customMessage && <span className="text-emerald-600">Customized</span>}
              </label>
              <div className="relative">
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={currentTopic.defaultText}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500/40 text-slate-700 resize-none font-sans font-medium leading-relaxed"
                />
              </div>
            </div>

            {/* Direct External Action Trigger */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-sans font-semibold text-xs py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all group"
            >
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span>Start Direct WhatsApp Chat</span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        id="whatsapp-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto relative w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group outline-none"
        aria-label="Contact via WhatsApp"
      >
        {/* Pulsing visual halo rings */}
        <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '2.5s' }} />
        
        {/* Inner dynamic icon toggle */}
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
        ) : (
          <MessageCircle className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
        )}

        {/* Floating attention bubble alert badge */}
        {showBadge && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            1
          </span>
        )}
      </button>
      
    </div>
  );
}
