import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface SEOData {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
}

const staticSEO: Record<string, SEOData> = {
  '/': {
    title: 'Award-Winning Luxury Indian Event Catering',
    description: 'Anjani Catering & Events offers premium Indian wedding catering, grand corporate gala banquets, and bespoke live food station solutions for luxury events in Mumbai and beyond.'
  },
  '/about': {
    title: 'About Our Indian Culinary Heritage',
    description: 'Learn about Anjani Catering & Events\'s rich history of crafting premium Indian culinary experiences, from royal weddings and sangeet functions to grand corporate events in Mumbai.'
  },
  '/team': {
    title: 'Our Master Chefs & Indian Catering Experts',
    description: 'Meet Anjani Catering & Events\'s team of master chefs, tandoor specialists, dessert designers, and professional banquet managers coordinating luxury celebrations in Mumbai.'
  },
  '/services': {
    title: 'Luxury Indian Wedding & Corporate Catering Services',
    description: 'Explore our premium services including custom royal wedding buffet setups, grand corporate galas, bespoke sangeet counters, and fine live-kitchen hospitality in Mumbai.'
  },
  '/packages': {
    title: 'Indian Wedding Catering Packages & Pricing Estimator',
    description: 'Calculate estimated Indian catering costs and service staff ratios. Find bespoke luxury packages for Royal Sangeet, Grand Wedding Buffets, and Corporate Galas in Mumbai.'
  },
  '/menu': {
    title: 'Royal Indian Catering & Feast Menus',
    description: 'Browse through Anjani Catering & Events\'s handcrafted Indian wedding menus. Explore signature tandoor appetizers, royal Awadhi main courses, artisanal desserts, and bespoke beverage stations in Mumbai.'
  },
  '/projects': {
    title: 'Our Celebrated Events, Royal Weddings & Case Stories',
    description: 'Explore Anjani Catering & Events\'s portfolio of beautifully executed royal wedding banquets, grand corporate galas, elegant Sangeet nights, and premium private celebrations in Mumbai.'
  },
  '/testimonials': {
    title: 'Host Testimonials & Client Reviews',
    description: 'Read reviews from luxury hosts in Mumbai. Read verified feedback from premium Indian wedding families, corporate sponsors, and high-end private celebrations.'
  },
  '/faqs': {
    title: 'Indian Event Catering FAQs & Planning Logistics',
    description: 'Have questions about booking event catering, Jain food options, regional Indian menu adaptations, wedding tasting sessions, or tableware rentals in Mumbai? Explore our FAQ directory.'
  },
  '/blogs': {
    title: 'Indian Culinary Blog, Recipes & Wedding Food Trends',
    description: 'Stay inspired with the latest Indian wedding catering trends, regional menu pairing ideas, traditional dessert designs, and luxury event hosting tips in Mumbai.'
  },
  '/contact': {
    title: 'Get In Touch - Request Indian Catering Quote',
    description: 'Contact our wedding and event catering coordinators in Mumbai. Request customized traditional & fusion menus, get custom pricing quotes, and plan your banquet.'
  },
  '/admin-login': {
    title: 'Admin Login - Control Panel Access',
    description: 'Access the Anjani Catering & Events admin portal to manage events, client requests, menu settings, and catering schedules in Mumbai.'
  },
  '/admin-signup': {
    title: 'Create Admin Account',
    description: 'Register a new coordinator or lead kitchen manager account on Anjani Catering & Events\'s control panel.'
  },
  '/admin': {
    title: 'Admin Dashboard - Management Portal',
    description: 'Manage bookings, client contacts, live menus, and user roles on Anjani Catering & Events\'s master control panel.'
  }
};

interface SEOConfigProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
}

export default function SEOConfig({ title: customTitle, description: customDescription, image: customImage, type: customType }: SEOConfigProps = {}) {
  const location = useLocation();
  const pathname = location.pathname;

  let seoData: SEOData | undefined = customTitle ? {
    title: customTitle,
    description: customDescription || 'Anjani Catering & Events offers luxury Indian wedding and corporate event catering in Mumbai.',
    image: customImage,
    type: customType
  } : staticSEO[pathname];

  // Subpath matching for admin views
  if (!seoData && pathname.startsWith('/admin/')) {
    const adminPage = pathname.split('/').pop() || 'dashboard';
    const capitalized = adminPage.charAt(0).toUpperCase() + adminPage.slice(1);
    seoData = {
      title: `Admin ${capitalized} - Anjani Catering & Events`,
      description: `Verify date pre-holds, analyze custom catering financials, and moderate staff permissions on the ${adminPage} panel.`
    };
  }

  // Fallback default metadata if no route matched
  if (!seoData) {
    seoData = {
      title: 'Luxury Event Catering Mumbai',
      description: 'Anjani Catering & Events offers premium Indian wedding catering, grand corporate gala banquets, and bespoke live food station solutions for luxury events in Mumbai and Western India.'
    };
  }

  const siteName = 'Anjani Catering & Events';
  const fullTitle = `${seoData.title} | ${siteName}`;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://evengcatering.com';
  const canonicalUrl = `${baseUrl}${pathname}`;
  const defaultImage = 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80';
  const image = seoData.image || defaultImage;
  const type = seoData.type || 'website';

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={seoData.description} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
