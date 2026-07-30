import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';
import { COMPANY_NAME } from '../config/env';

interface SEOData {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  keywords?: string;
}

const staticSEO: Record<string, SEOData> = {
  '/': {
    title: 'Award-Winning Indian Wedding Catering in Chhatarpur, MP',
    description: 'Anjani Catering & Events offers premium Indian wedding catering, grand celebration banquets, and bespoke live food stations for events in Chhatarpur, Madhya Pradesh, and across Bundelkhand.'
  },
  '/about': {
    title: 'About Our Indian Catering Heritage in Chhatarpur, MP',
    description: 'Learn about Anjani Catering & Events\'s rich history of crafting premium Indian culinary experiences, from royal weddings and sangeet functions to grand corporate events in Chhatarpur, Madhya Pradesh.'
  },
  '/team': {
    title: 'Our Expert Chefs & Indian Catering Team in Chhatarpur',
    description: 'Meet Anjani Catering & Events\'s team of master chefs, tandoor specialists, dessert designers, and event managers coordinating luxury celebrations in Chhatarpur and across Madhya Pradesh.'
  },
  '/services': {
    title: 'Indian Wedding & Event Catering Services in Chhatarpur, MP',
    description: 'Explore our premium services including wedding catering, reception buffets, sangeet counters, mehendi functions, haldi ceremonies, and corporate event catering in Chhatarpur, Madhya Pradesh.'
  },
  '/packages': {
    title: 'Indian Wedding Catering Packages & Pricing | Chhatarpur, MP',
    description: 'Explore our catering packages for weddings, receptions, and corporate events in Chhatarpur. Calculate estimated costs, find royal wedding menus, and book your celebration today.'
  },
  '/menu': {
    title: 'Royal Indian Wedding Menu | Catering in Chhatarpur, MP',
    description: 'Browse Anjani Catering & Events\'s handcrafted Indian wedding menus. Explore signature tandoor appetizers, royal main courses, traditional desserts, and regional Bundelkhandi specialties.'
  },
  '/projects': {
    title: 'Our Events & Royal Weddings | Catering in Madhya Pradesh',
    description: 'Explore Anjani Catering & Events\'s portfolio of beautifully executed royal wedding banquets, grand corporate events, elegant sangeet nights, and celebrations across Chhatarpur and Madhya Pradesh.'
  },
  '/testimonials': {
    title: 'Client Reviews & Testimonials | Anjani Catering Chhatarpur',
    description: 'Read reviews from our clients in Chhatarpur, Khajuraho, and across Madhya Pradesh. See feedback from wedding families, corporate clients, and celebration hosts.'
  },
  '/faqs': {
    title: 'Indian Event Catering FAQs | Anjani Catering Chhatarpur',
    description: 'Get answers about booking event catering in Chhatarpur, Jain food options, regional Indian menu customization, wedding tasting sessions, and catering packages in Madhya Pradesh.'
  },
  '/blogs': {
    title: 'Indian Catering Blog | Wedding Trends & Menu Ideas | MP',
    description: 'Stay inspired with the latest Indian wedding catering trends, regional menu ideas, traditional dessert designs, festival catering tips, and event planning advice from Chhatarpur, Madhya Pradesh.'
  },
  '/contact': {
    title: 'Contact Us | Indian Catering in Chhatarpur, MP',
    description: 'Contact Anjani Catering & Events for wedding and event catering inquiries in Chhatarpur, Madhya Pradesh. Request customized menus, get pricing, and plan your celebration.'
  },
  '/admin-login': {
    title: 'Admin Login - Catering Management Panel',
    description: 'Access the Anjani Catering & Events admin portal to manage events, client bookings, menu settings, and catering schedules.'
  },
  '/admin-signup': {
    title: 'Create Admin Account',
    description: 'Register a new coordinator or manager account on Anjani Catering & Events\'s management panel.'
  },
  '/admin': {
    title: 'Admin Dashboard - Catering Management',
    description: 'Manage bookings, client inquiries, menus, and user roles on Anjani Catering & Events\'s master control panel.'
  }
};

interface SEOConfigProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  keywords?: string;
}

export default function SEOConfig({ title: customTitle, description: customDescription, image: customImage, type: customType, keywords: customKeywords }: SEOConfigProps = {}) {
  const location = useLocation();
  const { language } = useLanguage();
  const pathname = location.pathname;

  let seoData: SEOData | undefined = customTitle ? {
    title: customTitle,
    description: customDescription || 'Anjani Catering & Events offers premium Indian wedding and corporate event catering in Chhatarpur, Madhya Pradesh.',
    image: customImage,
    type: customType,
    keywords: customKeywords
  } : staticSEO[pathname];

  if (!seoData && pathname.startsWith('/admin/')) {
    const adminPage = pathname.split('/').pop() || 'dashboard';
    const capitalized = adminPage.charAt(0).toUpperCase() + adminPage.slice(1);
    seoData = {
      title: `Admin ${capitalized} - Anjani Catering & Events`,
      description: `Manage bookings, catering inquiries, and event schedules on the ${adminPage} panel.`
    };
  }

  if (!seoData) {
    seoData = {
      title: 'Indian Wedding Catering in Chhatarpur, Madhya Pradesh',
      description: 'Anjani Catering & Events offers premium Indian wedding catering, celebration banquets, and live food station solutions for events in Chhatarpur, Madhya Pradesh, and across Bundelkhand.'
    };
  }

  const siteName = COMPANY_NAME;
  const fullTitle = `${seoData.title} | ${siteName}`;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://anjanievents.in';
  const canonicalUrl = `${baseUrl}${pathname}`;
  const defaultImage = 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80';
  const image = seoData.image || defaultImage;
  const type = seoData.type || 'website';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={seoData.description} />
      {seoData.keywords && <meta name="keywords" content={seoData.keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={language === 'HI' ? 'hi_IN' : 'en_IN'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={image} />

      <link rel="alternate" href={`${baseUrl}/en${pathname}`} hrefLang="en" />
      <link rel="alternate" href={`${baseUrl}/hi${pathname}`} hrefLang="hi" />
      <link rel="alternate" href={`${baseUrl}${pathname}`} hrefLang="x-default" />
    </Helmet>
  );
}
