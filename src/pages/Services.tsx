import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Briefcase, Sparkles, GlassWater, ArrowRight, CheckCircle2 } from 'lucide-react';
import PageBanner from '../components/layout/PageBanner';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { getServices } from '../data/getAsyncData';
import LazyImage from '../components/ui/LazyImage';
import { useLanguage } from '../context/LanguageContext';
import { useAsyncData } from '../hooks/useAsyncData';

export default function Services() {
  const { language, t } = useLanguage();
  const { data: services } = useAsyncData(() => getServices(language), [], [language]);

  return (
    <div>
      <SEO 
        title={t('servicesTitle')} 
        description={t('servicesSubtitle')}
        urlPath="/services"
      />
      <PageBanner 
        title={t('servicesTitle')} 
        breadcrumbs={[{ name: t('services') }]} 
        backgroundImage="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80"
      />

      {/* Services Grid Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up" duration={0.7} className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-4">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              {t('servicesTitle')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
              {t('servicesSubtitle')}
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="up" staggerChildren={true} stagger={0.15} className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {services.map((service) => {
              const IconComp = 
                service.icon === 'Heart' ? Heart : 
                service.icon === 'Briefcase' ? Briefcase :
                service.icon === 'Sparkles' ? Sparkles : GlassWater;

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group text-left"
                >
                  <div>
                    {/* Visual Card Image Cover */}
                    <div className="h-64 overflow-hidden relative">
                      <LazyImage
                        src={service.image}
                        alt={service.title}
                        wrapperClassName="w-full h-full"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                      
                      {/* Floating Service Icon */}
                      <div className="absolute bottom-4 left-6 bg-secondary text-primary p-4 rounded-2xl shadow-lg">
                        <IconComp className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-8 flex flex-col gap-4">
                      <h3 className="font-serif text-2xl font-bold text-secondary group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="font-sans text-slate-600 text-sm leading-relaxed font-medium">
                        {service.shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Expand Service Details Link footer */}
                  <div className="px-8 pb-8 pt-2">
                    <Link
                      to={`/services/${service.slug}`}
                      className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-hover text-white font-sans font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-sm transition-all"
                    >
                      <span>{t('readMore')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </ScrollReveal>

        </div>
      </section>

      {/* Trust & Guarantee banner */}
      <section className="bg-linen py-16 border-t border-accent/10">
        <ScrollReveal direction="up" className="max-w-4xl mx-auto px-4 text-center flex flex-col gap-5 items-center">
          <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold">
            {t('servicesTitle')}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-secondary leading-tight max-w-lg">
            {language === 'HI' ? 'हमारी सेवा का वादा' : 'Our Service Promise'}
          </h2>
          <div className="pt-2">
            <Link
              to="/contact"
              className="bg-primary hover:bg-primary-hover text-secondary font-sans font-bold text-sm px-8 py-3.5 rounded-full shadow-md transition-transform"
            >
              {t('contactUs')}
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
