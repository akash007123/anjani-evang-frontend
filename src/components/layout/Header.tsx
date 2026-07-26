import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Calendar, Phone, Mail, Instagram, Facebook, Twitter, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { navigationConfig, isPathActive, isDropdownActive } from '../../data/navigation';
import { COMPANY_PHONE, COMPANY_EMAIL } from '../../config/env';
import NavDropdown from './NavDropdown';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedDropdown, setMobileExpandedDropdown] = useState<string | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and collapse accordion on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setMobileExpandedDropdown(null);
  }, [pathname]);

  const isHome = pathname === '/';

  return (
    <>
      {/* Top Bar for Contact Info */}
      <div className={`hidden lg:flex justify-between items-center px-8 py-2 text-xs transition-all duration-300 ${
        isScrolled 
          ? 'bg-secondary text-white/80 h-0 py-0 overflow-hidden opacity-0' 
          : 'bg-[#102417] text-white/90 border-b border-white/10'
      }`}>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span>{COMPANY_PHONE}</span>
          </span>
          <span className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-primary" />
            <span>{COMPANY_EMAIL}</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/60">{t('openHours')}</span>
          <div className="flex items-center gap-4 border-l border-white/20 pl-4">
            <a href="/project.zip" download="project.zip" className="text-primary hover:text-white transition-colors flex items-center gap-1.5 font-bold text-xs">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>{t('downloadZip')}</span>
            </a>
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram"><Instagram className="w-3.5 h-3.5" /></a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Facebook"><Facebook className="w-3.5 h-3.5" /></a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter"><Twitter className="w-3.5 h-3.5" /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Sticky Header */}
      <header
        id="main-header"
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'top-0 bg-secondary shadow-lg py-3'
            : isHome
            ? 'top-0 lg:top-8 bg-transparent py-5'
            : 'top-0 lg:top-8 bg-secondary/95 backdrop-blur-md py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center transition-transform duration-500 group-hover:rotate-180 shadow-md">
              <span className="text-secondary font-bold text-lg">अं</span>
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-widest text-white block group-hover:text-primary transition-colors duration-300">
                EVENG
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-primary block -mt-1 font-medium">
                Catering Services
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
            {navigationConfig.map((item) => {
              if (item.dropdown) {
                return <NavDropdown key={item.id} item={item} />;
              }

              const isActive = isPathActive(pathname, item.path || '');
              return (
                <Link
                  key={item.id}
                  to={item.path || '#'}
                  className={`relative py-1 font-sans font-medium text-sm transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs ${
                    isActive ? 'text-primary font-semibold' : 'text-white/90 hover:text-primary'
                  }`}
                >
                  {t(item.nameKey)}
                  {/* Underline Indicator */}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Call To Action button & Language Switcher */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/10 p-1 rounded-full border border-white/15 backdrop-blur-sm">
              <Globe className="w-3.5 h-3.5 text-primary ml-2 mr-1" />
              <button
                type="button"
                onClick={() => setLanguage('EN')}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                  language === 'EN'
                    ? 'bg-primary text-secondary shadow-sm'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('HI')}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                  language === 'HI'
                    ? 'bg-primary text-secondary shadow-sm'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <Link
              to="/contact"
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-secondary font-sans font-semibold text-sm px-6 py-2.5 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
            >
              <Calendar className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>{t('getQuote')}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-white hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            aria-label="Toggle Navigation Menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          className={`fixed inset-y-0 right-0 z-40 w-80 bg-secondary shadow-2xl p-6 flex flex-col justify-between transition-transform duration-500 lg:hidden overflow-y-auto ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            {/* Mobile Header */}
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <span className="font-serif text-xl font-bold tracking-widest text-white">EVENG</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white/10 p-1 rounded-full border border-white/15">
                  <button
                    type="button"
                    onClick={() => setLanguage('EN')}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      language === 'EN' ? 'bg-primary text-secondary' : 'text-white/70'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('HI')}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      language === 'HI' ? 'bg-primary text-secondary' : 'text-white/70'
                    }`}
                  >
                    HI
                  </button>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 text-white hover:text-primary cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Links */}
            <nav className="flex flex-col gap-2">
              {navigationConfig.map((item) => {
                if (item.dropdown) {
                  const isDropdownParentActive = isDropdownActive(pathname, item.dropdown);
                  const isExpanded = mobileExpandedDropdown === item.id;

                  return (
                    <div key={item.id} className="flex flex-col border-b border-white/5 py-1">
                      <button
                        type="button"
                        onClick={() => setMobileExpandedDropdown(isExpanded ? null : item.id)}
                        className={`flex justify-between items-center font-sans font-semibold text-base py-2 text-left w-full cursor-pointer transition-colors ${
                          isDropdownParentActive ? 'text-primary font-bold' : 'text-white/95 hover:text-primary'
                        }`}
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-center gap-2">
                          <span>{t(item.nameKey)}</span>
                          {isDropdownParentActive && (
                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                              Active
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isExpanded ? 'rotate-180 text-primary' : 'text-white/60'
                          }`}
                        />
                      </button>

                      {/* Accordion Submenu */}
                      <div
                        className={`flex flex-col pl-4 gap-1 mt-1 transition-all duration-300 overflow-hidden ${
                          isExpanded ? 'max-h-96 opacity-100 py-1' : 'max-h-0 opacity-0 py-0'
                        }`}
                      >
                        {item.dropdown.map((sub) => {
                          const isSubActive = isPathActive(pathname, sub.path);
                          return (
                            <Link
                              key={sub.id}
                              to={sub.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center justify-between font-sans text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                                isSubActive
                                  ? 'bg-primary/20 text-primary font-bold'
                                  : 'text-white/70 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <span>{t(sub.nameKey)}</span>
                              {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                const isActive = isPathActive(pathname, item.path || '');
                return (
                  <Link
                    key={item.id}
                    to={item.path || '#'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`font-sans font-semibold text-base py-2.5 border-b border-white/5 transition-colors duration-200 flex items-center justify-between ${
                      isActive ? 'text-primary font-bold' : 'text-white/95 hover:text-primary'
                    }`}
                  >
                    <span>{t(item.nameKey)}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Mobile Footer/CTA */}
          <div className="flex flex-col gap-5 pt-6 border-t border-white/10 mt-6">
            <div className="text-white/70 text-xs flex flex-col gap-2">
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-primary" /> {COMPANY_PHONE}</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-primary" /> {COMPANY_EMAIL}</p>
              <a href="/project.zip" download="project.zip" className="flex items-center gap-2 text-primary font-bold mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>{t('downloadZip')}</span>
              </a>
            </div>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center bg-primary hover:bg-primary-hover text-secondary font-sans font-semibold py-3 rounded-full shadow-lg transition-transform hover:scale-[1.02]"
            >
              {t('getQuote')}
            </Link>
          </div>
        </div>

        {/* Backdrop overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </header>
    </>
  );
}
