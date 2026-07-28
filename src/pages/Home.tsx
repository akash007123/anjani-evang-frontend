import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Briefcase, Sparkles, GlassWater, 
  Star, Check, Award, ArrowRight, ChevronDown, ChevronUp, CheckCircle2 
} from 'lucide-react';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { getServices, getMenuItems, getPackages, getTestimonials, getFAQs } from '../data/getAsyncData';
import { useAsyncData } from '../hooks/useAsyncData';
import TestimonialCarousel from '../components/TestimonialCarousel';
import LazyImage from '../components/ui/LazyImage';
import { useLanguage } from '../context/LanguageContext';

// Custom CountUp Component
function CountUpNumber({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [end]);

  return <span>{count}{suffix}</span>;
}

export default function Home() {
  const { language, t } = useLanguage();
  const [activeMenuCategory, setActiveMenuCategory] = useState<'Appetizers' | 'Main Courses' | 'Desserts' | 'Beverages'>('Appetizers');
  const [activeFAQ, setActiveFAQ] = useState<string | null>(null);

  const { data: services } = useAsyncData(() => getServices(language), [] as any[], [language]);
  const { data: menuItems } = useAsyncData(() => getMenuItems(language), [] as any[], [language]);
  const { data: packages } = useAsyncData(() => getPackages(language), [] as any[], [language]);
  const { data: testimonials } = useAsyncData(() => getTestimonials(language), [] as any[], [language]);
  const { data: faqs } = useAsyncData(() => getFAQs(language), [] as any[], [language]);

  // Filter menu items for Chef's selection
  const filteredMenuItems = menuItems
    .filter(item => {
      if (activeMenuCategory === 'Appetizers') return item.category.toLowerCase().includes('starter') || item.category.toLowerCase().includes('appetizer') || item.category.toLowerCase().includes('स्टार्टर');
      if (activeMenuCategory === 'Main Courses') return item.category.toLowerCase().includes('main') || item.category.toLowerCase().includes('मुख्य');
      if (activeMenuCategory === 'Desserts') return item.category.toLowerCase().includes('dessert') || item.category.toLowerCase().includes('sweet') || item.category.toLowerCase().includes('मीठा');
      return item.category.toLowerCase().includes('beverage') || item.category.toLowerCase().includes('drink') || item.category.toLowerCase().includes('पेय');
    })
    .slice(0, 4);

  return (
    <div className="overflow-hidden">
      <SEO 
        title={t('home:heroTitle')} 
        description={t('home:heroSubtitle')}
        urlPath="/"
      />
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] sm:min-h-screen bg-secondary flex items-center justify-center pt-24 pb-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 filter saturate-150 scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1920&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/95 to-secondary/80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column Copy */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide text-primary">
                <Star className="w-4 h-4 fill-primary" />
                <span>{t('home:aboutTag')}</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
                {t('home:heroTitle')}
              </h1>
              <p className="font-sans text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl font-medium">
                {t('home:heroSubtitle')}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to="/booking"
                  className="bg-primary hover:bg-primary-hover text-secondary font-sans font-bold text-sm sm:text-base px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  {t('getQuote')}
                </Link>
                <Link
                  to="/menu"
                  className="border-2 border-white/20 hover:border-primary text-white hover:text-primary font-sans font-bold text-sm sm:text-base px-8 py-4 rounded-full transition-all duration-300"
                >
                  {t('home:exploreMenu')}
                </Link>
              </div>
            </div>

            {/* Right Column Visual Collage */}
            <div className="lg:col-span-5 relative hidden sm:block">
              <div className="relative mx-auto w-full max-w-md h-[420px]">
                <div className="absolute top-0 left-0 w-[85%] h-[80%] rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl z-10">
                  <LazyImage
                    src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"
                    alt="Elegant wedding banquet"
                    wrapperClassName="w-full h-full"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-4 right-4 w-[65%] h-[60%] rounded-2xl overflow-hidden border-4 border-primary/40 shadow-2xl z-20 hover:scale-105 transition-transform duration-500">
                  <LazyImage
                    src="https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=400&q=80"
                    alt="Artisanal food appetizer platter"
                    wrapperClassName="w-full h-full"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-32 h-32 border-t-2 border-r-2 border-primary/50 pointer-events-none rounded-tr-xl" />
                <div className="absolute -bottom-2 -left-2 w-32 h-32 border-b-2 border-l-2 border-primary/50 pointer-events-none rounded-bl-xl" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATISTICS BAR */}
      <section className="bg-linen py-12 relative z-20 -mt-8 mx-4 sm:mx-8 md:mx-16 rounded-2xl shadow-xl border border-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" duration={0.8} distance={35}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-accent/20">
              <div className="flex flex-col gap-1 py-4 md:py-0">
                <span className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-secondary">
                  <CountUpNumber end={450} suffix="+" />
                </span>
                <span className="text-slate-600 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider">{t('home:eventsCount')}</span>
              </div>
              <div className="flex flex-col gap-1 py-4 md:py-0">
                <span className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-secondary">
                  <CountUpNumber end={180} suffix="K+" />
                </span>
                <span className="text-slate-600 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider">{t('home:platesServed')}</span>
              </div>
              <div className="flex flex-col gap-1 py-4 md:py-0">
                <span className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-secondary">
                  <CountUpNumber end={15} suffix="+" />
                </span>
                <span className="text-slate-600 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider">{t('home:masterChefs')}</span>
              </div>
              <div className="flex flex-col gap-1 py-4 md:py-0">
                <span className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-secondary">
                  <CountUpNumber end={99} suffix="%" />
                </span>
                <span className="text-slate-600 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider">{t('home:happyClients')}</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. ABOUT PREVIEW SECTION */}
      <section className="py-20 sm:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <ScrollReveal direction="right" duration={0.9} className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <LazyImage
                    src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=500&q=80"
                    alt="High-end buffet setups"
                    wrapperClassName="w-full h-64"
                    className="w-full h-64 object-cover rounded-2xl shadow-md transition-transform duration-500 hover:scale-[1.02]"
                  />
                  <div className="bg-[#102417] text-white p-6 rounded-2xl flex flex-col justify-center text-center border border-white/5">
                    <span className="font-serif text-4xl sm:text-5xl font-bold text-primary">15+</span>
                    <span className="text-xs uppercase tracking-wider font-semibold text-white/70">{t('yearsOfService')}</span>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <LazyImage
                    src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=500&q=80"
                    alt="Catering Chef arranging desserts"
                    wrapperClassName="w-full h-80"
                    className="w-full h-80 object-cover rounded-2xl shadow-md transition-transform duration-500 hover:scale-[1.02]"
                  />
                </div>
              </div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10" />
            </ScrollReveal>

            <ScrollReveal direction="left" duration={0.9} className="flex flex-col gap-6 text-left">
              <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
                {t('ourHeritage')}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
                {t('aboutSubtitle')}
              </h2>
              <p className="font-sans text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                {t('home:aboutSubtitle')}
              </p>
              <div className="space-y-3 pt-2">
                {[
                  language === 'HI' ? '100% ताजी और शुद्ध सामग्री से तैयार किए गए व्यंजन' : '100% fresh, pure ingredients for authentic Indian flavours',
                  language === 'HI' ? 'मध्य प्रदेश के स्थानीय बाजारों से चुनी गई सामग्री' : 'Locally sourced ingredients from MP farms and markets',
                  language === 'HI' ? 'अनुभवी शेफ और इवेंट टीम द्वारा पेशेवर सेवा' : 'Professional service by our experienced chefs and event team',
                  language === 'HI' ? 'पारंपरिक और आधुनिक शैली में सुंदर प्रस्तुति' : 'Elegant presentation blending traditional and modern styles'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium font-sans">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-secondary" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex items-center gap-6">
                <Link
                  to="/about"
                  className="bg-secondary hover:bg-secondary-hover text-white font-sans font-semibold text-sm sm:text-base px-7 py-3.5 rounded-full shadow-md transition-all duration-300"
                >
                  {t('aboutUs')}
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-accent/30 flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="block font-serif text-sm font-bold text-secondary">ISO 22000 Certified</span>
                    <span className="block text-[10px] text-slate-500 font-sans">Highest Food Safety Standards</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* 4. SERVICES SECTION */}
      <section className="py-20 bg-secondary text-white relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80')` }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <ScrollReveal direction="up" duration={0.7} className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              {t('servicesTitle')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              {t('servicesSubtitle')}
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="up" staggerChildren={true} stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services
              .filter(s => s.featured)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .slice(0, 4)
              .map((service) => {
              const IconComp = 
                service.icon === 'Heart' ? Heart : 
                service.icon === 'Briefcase' ? Briefcase :
                service.icon === 'Sparkles' ? Sparkles : GlassWater;

              return (
                <div
                  key={service.id}
                  className="bg-[#193221] rounded-2xl overflow-hidden border border-white/5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between group"
                >
                  <div>
                    <div className="h-48 overflow-hidden relative">
                      <LazyImage
                        src={service.image}
                        alt={service.title}
                        wrapperClassName="w-full h-full"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#193221] to-transparent" />
                      <div className="absolute bottom-4 left-4 bg-primary p-3 rounded-xl text-secondary shadow-md">
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-6 text-left flex flex-col gap-3">
                      <h3 className="font-serif text-xl font-bold text-white group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="font-sans text-white/70 text-xs sm:text-sm leading-relaxed font-medium">
                        {service.shortDescription.substring(0, 120)}...
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 text-left">
                    <Link
                      to={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:text-white font-sans text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <span>{t('readMore')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </ScrollReveal>

        </div>
      </section>

      {/* 5. CHEF'S SELECTION FOOD MENU SECTION */}
      <section className="py-20 sm:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up" duration={0.7} className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-4">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              {t('menuTitle')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
              {t('menuSubtitle')}
            </h2>
          </ScrollReveal>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {(['Appetizers', 'Main Courses', 'Desserts', 'Beverages'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveMenuCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-sans font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
                  activeMenuCategory === cat
                    ? 'bg-primary text-secondary shadow-md'
                    : 'bg-white hover:bg-linen text-slate-700 border border-slate-100'
                }`}
              >
                {cat === 'Appetizers' ? (language === 'HI' ? 'स्टार्टर्स' : 'Appetizers') :
                 cat === 'Main Courses' ? (language === 'HI' ? 'मुख्य व्यंजन' : 'Main Courses') :
                 cat === 'Desserts' ? (language === 'HI' ? 'मिठाइयां' : 'Desserts') :
                 (language === 'HI' ? 'पेय पदार्थ' : 'Beverages')}
              </button>
            ))}
          </div>

          <ScrollReveal key={activeMenuCategory} direction="up" staggerChildren={true} stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 border border-slate-50 shadow-sm hover:shadow-md transition-shadow group text-left relative"
              >
                {item.isPopular && (
                  <span className="absolute top-3 right-3 bg-secondary text-primary font-sans text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md">
                    Signature
                  </span>
                )}

                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 relative bg-slate-100">
                  <LazyImage
                    src={item.image}
                    alt={item.name}
                    wrapperClassName="w-full h-full"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-2 border-b border-dashed border-slate-200 pb-1.5">
                    <h3 className="font-serif text-lg font-bold text-secondary group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <span className="font-serif text-lg font-extrabold text-secondary">
                      ₹{item.price}
                    </span>
                  </div>
                  <p className="font-sans text-slate-500 text-xs leading-relaxed font-medium">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {item.tags.map((tTag, idx) => (
                      <span key={idx} className="bg-linen text-slate-600 font-sans text-[10px] font-semibold px-2 py-0.5 rounded-md">
                        {tTag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </ScrollReveal>

          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-hover text-white font-sans font-semibold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-md transition-all"
            >
              <span>{t('home:exploreMenu')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 6. OUR PACKAGES PREVIEW SECTION */}
      <section className="py-20 sm:py-28 bg-linen border-y border-accent/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up" duration={0.7} className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              {t('packagesTitle')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
              {t('packagesSubtitle')}
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="up" staggerChildren={true} stagger={0.15} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.slice(0, 3).map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl p-8 border shadow-md flex flex-col justify-between relative group ${
                  pkg.isPopular ? 'border-primary shadow-xl scale-[1.03] md:scale-[1.05]' : 'border-slate-100 hover:border-primary/50'
                }`}
              >
                {pkg.isPopular && pkg.ribbonText && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-primary text-secondary font-sans text-xs uppercase tracking-wider font-bold px-4 py-1 rounded-full shadow-md">
                    {pkg.ribbonText}
                  </span>
                )}

                <div>
                  <span className="text-slate-400 font-sans text-xs uppercase tracking-wider font-bold block mb-2">
                    {pkg.category} Package
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-secondary mb-4">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="font-serif text-4xl sm:text-5xl font-extrabold text-secondary">₹{pkg.pricePerPerson}</span>
                    <span className="font-sans text-xs text-slate-500 font-medium">/{t('pricePerPerson')}</span>
                  </div>
                  <p className="font-sans text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
                    {pkg.description}
                  </p>
                  <div className="space-y-3 mb-8 text-left">
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to="/booking"
                  className={`w-full py-3.5 rounded-full font-sans font-bold text-sm transition-all text-center ${
                    pkg.isPopular 
                      ? 'bg-primary hover:bg-primary-hover text-secondary shadow-md'
                      : 'bg-secondary hover:bg-secondary-hover text-white'
                  }`}
                >
                  {t('bookNow')}
                </Link>
              </div>
            ))}
          </ScrollReveal>

        </div>
      </section>

      {/* 7. TESTIMONIALS CAROUSEL SECTION */}
      <section className="py-20 sm:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" duration={0.7} className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              {t('testimonialsTitle')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
              {t('testimonialsSubtitle')}
            </h2>
          </ScrollReveal>

          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="py-20 bg-linen border-t border-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" duration={0.7} className="text-center mb-16 flex flex-col gap-4">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              {t('faqsTitle')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
              {t('faqsSubtitle')}
            </h2>
          </ScrollReveal>

          <div className="space-y-4 text-left">
            {faqs.map((faq) => {
              const isOpen = activeFAQ === faq.id;
              return (
                <div 
                  key={faq.id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => setActiveFAQ(isOpen ? null : faq.id)}
                    className="w-full p-6 flex items-center justify-between gap-4 text-left font-serif text-base sm:text-lg font-bold text-secondary hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-primary shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-0 font-sans text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-50 mt-1 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
