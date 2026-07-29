import { Helmet } from 'react-helmet-async';
import { COMPANY_NAME } from '../config/env';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  urlPath?: string;
  type?: 'website' | 'article';
  keywords?: string;
  robots?: string;
  canonicalUrl?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  locale?: string;
}

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://anjanievents.in';

export default function SEO({
  title,
  description = `${COMPANY_NAME} offers premium Indian wedding catering, grand celebration banquets, and bespoke live food station solutions for luxury events in Chhatarpur, Madhya Pradesh, and across Bundelkhand.`,
  image = 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
  urlPath = '',
  type = 'website',
  keywords,
  robots,
  canonicalUrl: customCanonical,
  publishedTime,
  modifiedTime,
  author,
  locale = 'en'
}: SEOProps) {
  const siteName = COMPANY_NAME;
  const fullTitle = `${title} | ${siteName}`;
  const canonicalUrl = customCanonical || `${BASE_URL}${urlPath}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {robots && <meta name="robots" content={robots} />}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
    </Helmet>
  );
}
