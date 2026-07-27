import { Link } from 'react-router-dom';
import { Target, Eye, Award, Clock, ShieldCheck, Heart } from 'lucide-react';
import PageBanner from '../components/layout/PageBanner';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { language, t } = useLanguage();

  const timelineMilestones = [
    {
      year: '2010',
      title: language === 'HI' ? 'हमारी विनम्र शुरुआत' : 'Our Humble Beginning',
      desc: language === 'HI' ? 'अंजनी कैटरिंग एंड इवेंट्स की शुरुआत छतरपुर, मध्य प्रदेश में एक छोटी सी रसोई से हुई। शुरुआत पारिवारिक समारोहों और छोटी शादियों से हुई।' : 'Anjani Catering & Events started with a small kitchen in Chhatarpur, Madhya Pradesh, serving family gatherings and intimate wedding ceremonies with love and authenticity.'
    },
    {
      year: '2014',
      title: language === 'HI' ? 'भव्य शादियों की शुरुआत' : 'Grand Weddings & Expansion',
      desc: language === 'HI' ? 'बुंदेलखंड और मध्य प्रदेश में बड़ी शादियों और समारोहों की जिम्मेदारी लेना शुरू किया। हमारी टीम ने खजुराहो, सागर और झाँसी में शानदार आयोजन किए।' : 'Began managing large weddings and celebrations across Bundelkhand and Madhya Pradesh. Our team delivered memorable events in Khajuraho, Sagar, and Jhansi.'
    },
    {
      year: '2019',
      title: language === 'HI' ? 'विस्तार और आधुनिकीकरण' : 'Growth & Modern Kitchen',
      desc: language === 'HI' ? 'एक आधुनिक रसोई सुविधा में स्थानांतरित हुए, जिससे एक साथ 1,500 से अधिक मेहमानों को बेहतरीन सेवा प्रदान करना संभव हुआ।' : 'Moved into a larger, modern kitchen facility, enabling us to serve over 1,500 guests simultaneously with the same quality and care.'
    },
    {
      year: '2024',
      title: language === 'HI' ? 'सम्मान और मान्यता' : 'Recognition & Certification',
      desc: language === 'HI' ? 'मध्य प्रदेश में शीर्ष कैटरर के रूप में पहचाने गए और अंतरराष्ट्रीय ISO 22000 प्रमाणन प्राप्त किया।' : 'Recognised as a leading caterer in Madhya Pradesh and achieved international ISO 22000 certification for food safety and hygiene excellence.'
    }
  ];

  return (
    <div>
      <SEO 
        title={t('aboutTitle')} 
        description={t('aboutSubtitle')}
        urlPath="/about"
      />
      <PageBanner 
        title={t('aboutTitle')} 
        breadcrumbs={[{ name: t('aboutUs') }]} 
        backgroundImage="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80"
      />

      {/* Story & Image Collage Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Copy */}
            <div className="text-left flex flex-col gap-6">
              <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
                {t('ourHeritage')}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-secondary leading-tight">
                {t('aboutSubtitle')}
              </h2>
              <p className="font-sans text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                {language === 'HI' ? 'हम मानते हैं कि हर समारोह खास होता है। पिछले 15 वर्षों से हमारा लक्ष्य एक ही है: प्रामाणिक स्वाद, बेहतरीन सेवा और गर्मजोशी भरी मेहमाननवाज़ी के साथ हर आयोजन को यादगार बनाना।' : 'We believe every celebration is special. For 15 years, our mission has remained the same: to make every event memorable with authentic flavours, warm hospitality, and flawless service.'}
              </p>
              
              {/* Core Attributes mini list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2.5 font-sans text-sm font-semibold text-secondary">
                  <Clock className="w-5 h-5 text-primary shrink-0" />
                  <span>{language === 'HI' ? 'समय पर सेवा का भरोसा' : 'Always On Time Service'}</span>
                </div>
                <div className="flex items-center gap-2.5 font-sans text-sm font-semibold text-secondary">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                  <span>{language === 'HI' ? '100% शुद्धता और साफ-सफाई' : '100% Purity & Hygiene'}</span>
                </div>
                <div className="flex items-center gap-2.5 font-sans text-sm font-semibold text-secondary">
                  <Award className="w-5 h-5 text-primary shrink-0" />
                  <span>{language === 'HI' ? 'अनुभवी शेफ और स्टाफ' : 'Experienced Chefs & Staff'}</span>
                </div>
                <div className="flex items-center gap-2.5 font-sans text-sm font-semibold text-secondary">
                  <Heart className="w-5 h-5 text-primary shrink-0" />
                  <span>{language === 'HI' ? 'हर स्वाद और ज़रूरत के लिए' : 'Customised for Every Need'}</span>
                </div>
              </div>
            </div>

            {/* Right Photo Mosaic */}
            <div className="relative">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-8">
                  <img
                    src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80"
                    alt="Main dining setup"
                    referrerPolicy="no-referrer"
                    className="w-full h-80 object-cover rounded-2xl shadow-xl hover:scale-[1.01] transition-transform"
                  />
                </div>
                <div className="col-span-4 space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=300&q=80"
                    alt="Canapés catering"
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover rounded-2xl shadow-md"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80"
                    alt="Premium cocktail pour"
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover rounded-2xl shadow-md"
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-primary text-secondary p-4 rounded-xl shadow-lg flex items-center gap-3">
                <span className="font-serif text-3xl font-extrabold">15Y</span>
                <span className="text-[10px] uppercase font-bold tracking-wider leading-none text-secondary/80">{t('yearsOfService')}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-linen border-y border-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            
            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-md border border-slate-100 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-secondary">
                {t('mission')}
              </h3>
              <p className="font-sans text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                {language === 'HI' ? 'प्रामाणिक स्वाद और बेहतरीन सेवा के साथ हर आयोजन को यादगार बनाना। हमारी टीम हर छोटी-बड़ी ज़रूरत का ध्यान रखती है।' : 'To make every celebration unforgettable with authentic flavours, warm hospitality, and flawless execution. We take care of every detail so you can enjoy your special day.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-md border border-slate-100 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
                <Eye className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-secondary">
                {t('vision')}
              </h3>
              <p className="font-sans text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                {language === 'HI' ? 'छतरपुर, मध्य प्रदेश और बुंदेलखंड क्षेत्र में कैटरिंग और इवेंट मैनेजमेंट के क्षेत्र में विश्वास और गुणवत्ता का मानक बनना।' : 'To be the most trusted name in catering and event management across Chhatarpur, Bundelkhand, and Madhya Pradesh, known for quality, authenticity, and exceptional service.'}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Chronological Milestone Timeline Section */}
      <section className="py-20 sm:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-4">
            <span className="text-primary uppercase tracking-[0.25em] text-xs sm:text-sm font-bold block">
              {t('journey')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
              {language === 'HI' ? 'हमारी यात्रा के पड़ाव' : 'Milestones of Growth'}
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto border-l border-primary/30 pl-6 sm:pl-8 space-y-12">
            {timelineMilestones.map((milestone, idx) => (
              <div key={idx} className="relative text-left group">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-cream shadow-md group-hover:scale-125 transition-transform duration-300" />
                
                <span className="font-serif text-2xl font-extrabold text-primary block mb-1">
                  {milestone.year}
                </span>
                
                <div className="bg-white rounded-2xl p-6 border border-slate-50 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-secondary mb-2">
                    {milestone.title}
                  </h3>
                  <p className="font-sans text-slate-500 text-xs sm:text-sm leading-relaxed">
                    {milestone.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Simple Mini Team Teaser CTA */}
      <section className="bg-secondary text-white py-16 relative">
        <div className="max-w-4xl mx-auto px-4 text-center flex flex-col gap-6 items-center">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white max-w-xl leading-tight">
            {t('teamTitle')}
          </h2>
          <p className="font-sans text-white/70 text-xs sm:text-sm max-w-md">
            {t('teamSubtitle')}
          </p>
          <div className="flex gap-4">
            <Link
              to="/team"
              className="bg-primary hover:bg-primary-hover text-secondary font-sans font-bold text-sm px-7 py-3 rounded-full transition-transform hover:scale-[1.02]"
            >
              {t('ourTeam')}
            </Link>
            <Link
              to="/contact"
              className="bg-white/10 hover:bg-white/15 text-white font-sans font-semibold text-sm px-7 py-3 rounded-full border border-white/15"
            >
              {t('contact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
