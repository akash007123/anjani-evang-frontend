import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle, Mail, MessageCircle } from 'lucide-react';
import PageBanner from '../components/layout/PageBanner';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { getFAQs } from '../data/getAsyncData';
import { useLanguage } from '../context/LanguageContext';
import { useAsyncData } from '../hooks/useAsyncData';

export default function FAQs() {
  const { language, t } = useLanguage();
  const { data: faqs } = useAsyncData(() => getFAQs(language), [], [language]);

  const [selectedCategory, setSelectedCategory] = useState<'All' | 'General' | 'Pricing' | 'Services' | 'Menu'>('All');
  const [activeFAQId, setActiveFAQId] = useState<string | null>(faqs[0]?.id || '1');

  const filteredFaqs = selectedCategory === 'All'
    ? faqs
    : faqs.filter(f => f.category === selectedCategory || f.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div>
      <SEO 
        title={t('faqsTitle')} 
        description={t('faqsSubtitle')}
        urlPath="/faqs"
      />
      <PageBanner 
        title={t('faqsTitle')} 
        breadcrumbs={[{ name: t('faqs') }]} 
        backgroundImage="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80"
      />

      {/* Main FAQs Accordion Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12 flex flex-col gap-4">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              {t('faqsTitle')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
              {t('faqsSubtitle')}
            </h2>
          </div>

          {/* Categories Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
            {['All', 'General', 'Pricing', 'Services', 'Menu'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`px-5 sm:px-6 py-2.5 rounded-full font-sans font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary text-secondary shadow-md'
                    : 'bg-white hover:bg-linen text-slate-700 border border-slate-100'
                }`}
              >
                {cat === 'All' ? t('all') : cat}
              </button>
            ))}
          </div>

          {/* Interactive Accordion List */}
          <div className="space-y-4 text-left">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-50 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setActiveFAQId(activeFAQId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left font-serif font-bold text-base sm:text-lg text-secondary hover:text-primary transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${activeFAQId === faq.id ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${
                  activeFAQId === faq.id ? 'max-h-64 opacity-100 border-t border-slate-50' : 'max-h-0 opacity-0'
                }`}>
                  <p className="p-6 font-sans text-slate-600 text-xs sm:text-sm leading-relaxed font-medium bg-cream/30">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
