import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Calculator } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import PageBanner from '../components/layout/PageBanner';
import SEO from '../components/SEO';
import { getPackages } from '../data/getAsyncData';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { useLanguage } from '../context/LanguageContext';
import { useAsyncData } from '../hooks/useAsyncData';

export default function Packages() {
  const { language, t } = useLanguage();
  const { data: packages } = useAsyncData(() => getPackages(language), [], [language]);

  const [selectedPkgId, setSelectedPkgId] = useState(packages[0]?.id || '1');
  const [guestCount, setGuestCount] = useState(100);

  const activePkg = packages.find(p => p.id === selectedPkgId) || packages[0];

  const baseCost = (activePkg?.pricePerPerson || 0) * guestCount;
  const staffNeeded = Math.max(2, Math.ceil(guestCount / 12));
  const serviceStaffCost = staffNeeded * 5000;
  const calculatedTotal = baseCost + serviceStaffCost;

  return (
    <div>
      <SEO 
        title={t('packagesTitle')} 
        description={t('packagesSubtitle')}
        urlPath="/packages"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": packages.map((pkg) => ({
              "@type": "Product",
              "name": pkg.name,
              "description": pkg.description,
              "category": pkg.category,
              "offers": {
                "@type": "Offer",
                "price": pkg.pricePerPerson,
                "priceCurrency": "INR",
                "description": `Starting at ₹${pkg.pricePerPerson.toLocaleString('en-IN')}/person`,
                "availability": "https://schema.org/InStock",
                "validFrom": new Date().toISOString().split('T')[0]
              }
            }))
          })}
        </script>
      </Helmet>
      <PageBanner 
        title={t('packagesTitle')} 
        breadcrumbs={[{ name: t('packages') }]} 
        backgroundImage="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80"
      />

      {/* Main Packages Grid Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-4">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              {t('packagesTitle')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
              {t('packagesSubtitle')}
            </h2>
          </div>

          {/* Pricing cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-lg flex flex-col justify-between relative group transition-all duration-300 hover:-translate-y-1.5 ${
                  pkg.isPopular ? 'border-primary shadow-xl ring-2 ring-primary/20 scale-[1.02]' : 'border-slate-100 hover:border-primary/40'
                }`}
              >
                {pkg.isPopular && pkg.ribbonText && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-primary text-secondary font-sans text-[10px] uppercase tracking-wider font-extrabold px-4 py-1.5 rounded-full shadow-md">
                    {pkg.ribbonText}
                  </span>
                )}

                <div>
                  <span className="text-slate-400 font-sans text-xs uppercase tracking-wider font-bold block mb-2">
                    {pkg.category} Package
                  </span>
                  
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-secondary mb-4 leading-tight">
                    {pkg.name}
                  </h3>

                  <div className="flex items-baseline gap-1 border-b border-slate-100 pb-5 mb-5">
                    <span className="font-serif text-3xl sm:text-4xl font-extrabold text-secondary">
                      ₹{pkg.pricePerPerson.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-500 font-sans text-xs sm:text-sm font-semibold">
                      /{t('pricePerPerson')}
                    </span>
                  </div>

                  <p className="font-sans text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                    {pkg.description}
                  </p>

                  <div className="bg-linen rounded-xl p-3 mb-6 text-left border border-accent/10">
                    <span className="text-[11px] text-slate-500 font-sans block">{t('minGuests')}: <strong>{pkg.minGuests}</strong></span>
                  </div>

                  <ul className="space-y-3 text-left mb-8">
                    {pkg.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 font-sans text-xs sm:text-sm text-slate-700 font-medium">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/booking"
                  className={`w-full text-center py-3 rounded-full font-sans font-bold text-xs sm:text-sm transition-all ${
                    pkg.isPopular
                      ? 'bg-primary hover:bg-primary-hover text-secondary shadow-md'
                      : 'bg-secondary hover:bg-secondary-hover text-white'
                  }`}
                >
                  {t('bookNow')}
                </Link>
              </div>
            ))}
          </div>

          {/* INTERACTIVE BUDGET ESTIMATOR COMPONENT */}
          <div className="bg-[#102417] text-white rounded-3xl p-6 sm:p-10 border border-white/5 shadow-xl max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white text-left">
                {language === 'HI' ? 'कैटरिंग बजट कैलकुलेटर' : 'Interactive Catering Cost Estimator'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              
              <div className="flex flex-col gap-6 text-left">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                    1. Select Package:
                  </label>
                  <select
                    value={selectedPkgId}
                    onChange={(e) => setSelectedPkgId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 font-sans text-sm focus:outline-none focus:border-primary text-white cursor-pointer"
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id} className="text-secondary bg-cream font-medium">
                        {p.name} (₹{p.pricePerPerson}/guest)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                      2. Guest Count:
                    </label>
                    <span className="font-serif text-lg font-bold text-white">{guestCount} Guests</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="1500"
                    step="25"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              </div>

              {/* Estimate Result Box */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col justify-between gap-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-white/70 font-sans border-b border-white/10 pb-2">
                    <span>Base Food Cost</span>
                    <span>₹{baseCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/70 font-sans border-b border-white/10 pb-2">
                    <span>Staff ({staffNeeded} Servers)</span>
                    <span>₹{serviceStaffCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-white font-serif pt-1">
                    <span>Estimated Total</span>
                    <span className="text-primary text-2xl">₹{calculatedTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Link
                  to="/booking"
                  className="w-full bg-primary hover:bg-primary-hover text-secondary font-sans font-bold text-sm py-3 rounded-full text-center shadow-md transition-transform hover:scale-[1.01]"
                >
                  {t('bookNow')}
                </Link>
              </div>

            </div>
          </div>

          <div className="mt-20">
            <AvailabilityCalendar />
          </div>

        </div>
      </section>
    </div>
  );
}
