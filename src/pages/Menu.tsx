import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Printer } from 'lucide-react';
import PageBanner from '../components/layout/PageBanner';
import SEO from '../components/SEO';
import { getMenuItems } from '../data/getAsyncData';
import { MenuSkeleton } from '../components/SkeletonGrid';
import LazyImage from '../components/ui/LazyImage';
import { useLanguage } from '../context/LanguageContext';
import { useAsyncData } from '../hooks/useAsyncData';

export default function Menu() {
  const { language, t } = useLanguage();
  const { data: menuItems } = useAsyncData(() => getMenuItems(language), [], [language]);

  const categories = [
    'All',
    'Welcome Drinks',
    'Mocktails',
    'Soups',
    'Starters',
    'Chaat Counter',
    'Live Counters',
    'Indian Breads',
    'Paneer Curries',
    'Vegetable Curries',
    'Dal Varieties',
    'Rice',
    'South Indian',
    'Chinese',
    'Punjabi Specials',
    'Gujarati Specials',
    'Rajasthani Specials',
    'Maharashtrian Specials',
    'Desserts & Sweets',
    'Ice Cream',
    'Beverages',
    'Pickles & Condiments',
    'Salads',
    'Papad',
    'Fruits'
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory || item.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div>
      <SEO 
        title={t('menuTitle')} 
        description={t('menuSubtitle')}
        urlPath="/menu"
      />

      <div className="print:hidden">
        <PageBanner 
          title={t('menuTitle')} 
          breadcrumbs={[{ name: t('menu') }]} 
          backgroundImage="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80"
        />

        {/* Main Menu Book Section */}
        <section className="py-20 bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-4">
              <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
                {t('menuTitle')}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
                {t('menuSubtitle')}
              </h2>

              {/* Dynamic Print PDF Trigger Button */}
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2.5 bg-secondary text-primary hover:bg-secondary-hover border border-primary/20 px-6 py-3 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-primary" />
                  Print Menu (PDF)
                </button>
              </div>
            </div>

            {/* Categories Selector Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto mb-16">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 sm:px-5 py-2.5 rounded-full font-sans font-bold text-[11px] sm:text-xs transition-all duration-300 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-primary text-secondary shadow-md scale-105'
                      : 'bg-white hover:bg-linen text-slate-700 border border-slate-100'
                  }`}
                >
                  {cat === 'All' ? t('all') : cat}
                </button>
              ))}
            </div>

            {/* Grid Layout of Food Cards */}
            {isLoading ? (
              <MenuSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6 border border-slate-50 shadow-sm hover:shadow-xl transition-all duration-300 group text-left relative animate-in fade-in duration-500"
                  >
                    {item.isPopular && (
                      <span className="absolute top-4 right-4 bg-secondary text-primary font-sans text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-md shadow-sm">
                        Signature
                      </span>
                    )}

                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shrink-0 bg-slate-100 relative">
                      <LazyImage
                        src={item.image}
                        alt={item.name}
                        wrapperClassName="w-full h-full"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {item.isPopular && (
                        <div className="absolute top-2 left-2 bg-primary text-secondary p-1.5 rounded-lg shadow-md">
                          <Flame className="w-4 h-4 fill-secondary" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-2.5">
                      <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-slate-200 pb-2">
                        <h3 className="font-serif text-xl font-bold text-secondary group-hover:text-primary transition-colors leading-snug">
                          {item.name}
                        </h3>
                        <span className="font-serif text-xl font-extrabold text-secondary">
                          ₹{item.price}
                        </span>
                      </div>
                      <p className="font-sans text-slate-500 text-xs leading-relaxed font-medium">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.tags.map((tTag, idx) => (
                          <span key={idx} className="bg-linen text-slate-600 font-sans text-[10px] font-semibold px-2.5 py-0.5 rounded-md">
                            {tTag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-16 pt-8 border-t border-accent/10">
              <Link
                to="/booking"
                className="bg-primary hover:bg-primary-hover text-secondary font-sans font-bold text-sm sm:text-base px-10 py-4 rounded-full shadow-lg transition-transform hover:scale-[1.02]"
              >
                {t('getQuote')}
              </Link>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
