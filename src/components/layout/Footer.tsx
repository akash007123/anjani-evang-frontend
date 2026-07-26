import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin, Send, ArrowUp } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';
import { COMPANY_ADDRESS, COMPANY_PHONE, COMPANY_EMAIL } from '../../config/env';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const emailToSubscribe = email;
    setEmail('');
    setSubscribed(true);
    toast.success(t('subscribed'), t('subscribe'));

    try {
      const result = await api.subscribeNewsletter(emailToSubscribe);
      if (!result.success) {
        console.warn("Backend newsletter subscription returned non-ok status:", result.error);
      }
    } catch (apiErr) {
      console.error("Backend newsletter subscription failed (offline/fallback mode active):", apiErr);
    }

    setTimeout(() => setSubscribed(false), 5000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const instagramImages = [
    'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80',
  ];

  return (
    <footer className="bg-secondary text-white relative pt-16 pb-8 border-t border-white/5">
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary hover:bg-primary-hover text-secondary p-3 rounded-full shadow-xl transition-all hover:-translate-y-1 focus:outline-none"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Section */}
        <div className="bg-[#102417] rounded-2xl p-6 sm:p-10 mb-16 border border-white/5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
              {t('newsletter')}
            </h3>
            <p className="text-white/60 text-xs sm:text-sm font-sans font-medium">
              {t('subscribeText')}
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
            <div className="relative flex items-center">
              <input
                type="email"
                required
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-5 pr-14 text-sm focus:outline-none focus:border-primary text-white font-sans transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 bg-primary hover:bg-primary-hover text-secondary p-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Subscribe"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {subscribed && (
              <p className="text-primary text-xs mt-2 ml-4 font-medium animate-fade-in">
                {t('subscribed')}
              </p>
            )}
          </form>
        </div>

        {/* Main Footer Links & Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Socials Column */}
          <div className="flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-secondary font-bold text-base">अं</span>
              </div>
              <span className="font-serif text-xl font-bold tracking-widest text-white">EVENG</span>
            </Link>
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed font-sans">
              {t('footerTagline')}
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary hover:text-secondary transition-all flex items-center justify-center text-white/80" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary hover:text-secondary transition-all flex items-center justify-center text-white/80" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary hover:text-secondary transition-all flex items-center justify-center text-white/80" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary hover:text-secondary transition-all flex items-center justify-center text-white/80" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col gap-4">
            <h4 className="font-serif text-lg font-bold text-white border-b border-white/10 pb-2">
              {t('quickLinks')}
            </h4>
            <ul className="flex flex-col gap-2.5 font-sans text-xs sm:text-sm text-white/70">
              <li>
                <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>{t('home')}</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>{t('about')}</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>{t('services')}</span>
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>{t('menu')}</span>
                </Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>{t('packages')}</span>
                </Link>
              </li>
              <li>
                <a href="/project.zip" download="project.zip" className="text-primary hover:text-white transition-colors flex items-center gap-1.5 font-semibold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>{t('downloadZip')}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Useful Links Column */}
          <div className="flex flex-col gap-4">
            <h4 className="font-serif text-lg font-bold text-white border-b border-white/10 pb-2">
              {t('explore')}
            </h4>
            <ul className="flex flex-col gap-2.5 font-sans text-xs sm:text-sm text-white/70">
              <li>
                <Link to="/team" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>{t('ourTeam')}</span>
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>{t('projects')}</span>
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>{t('testimonials')}</span>
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>{t('faqs')}</span>
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>{t('blog')}</span>
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-primary/90 hover:underline transition-all flex items-center gap-1 font-semibold text-primary">
                  <span>{t('admin')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Instagram & Contact Info Column */}
          <div className="flex flex-col gap-5">
            <h4 className="font-serif text-lg font-bold text-white border-b border-white/10 pb-2">
              {t('contactUs')}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {instagramImages.map((src, index) => (
                <div key={index} className="aspect-square rounded-md overflow-hidden relative group">
                  <img
                    src={src}
                    alt="Instagram catering work"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-primary" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Contact quick summaries */}
            <div className="flex flex-col gap-2 pt-2 text-xs text-white/70 font-sans">
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{COMPANY_ADDRESS}</span>
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{COMPANY_PHONE}</span>
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Block */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50 font-sans">
          <p>© {new Date().getFullYear()} Anjani Catering & Events. {t('copyright')}</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">{t('privacyPolicy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('termsConditions')}</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
