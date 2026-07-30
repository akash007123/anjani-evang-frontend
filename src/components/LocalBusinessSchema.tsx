import { Helmet } from 'react-helmet-async';
import { COMPANY_EMAIL, COMPANY_PHONE, COMPANY_ADDRESS, COMPANY_NAME, FACEBOOK_URL, INSTAGRAM_URL } from '../config/env';

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://anjanievents.in';

export default function LocalBusinessSchema() {
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'CateringService', 'FoodService'],
    '@id': `${SITE_URL}/#business`,
    'name': COMPANY_NAME,
    'image': [
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'
    ],
    'telephone': COMPANY_PHONE,
    'email': COMPANY_EMAIL,
    'url': SITE_URL,
    'priceRange': '₹₹₹₹',
    'description': `${COMPANY_NAME} offers premium Indian wedding catering, grand celebration banquets, and bespoke live food station solutions for luxury events across Chhatarpur, Bundelkhand, and Madhya Pradesh.`,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Maharastra Marg, Rani ki Bagiya',
      'addressLocality': 'Chhatarpur',
      'addressRegion': 'Madhya Pradesh',
      'postalCode': '471001',
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 24.9157,
      'longitude': 79.5833
    },
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'opens': '09:00',
        'closes': '18:00'
      }
    ],
    'areaServed': [
      { '@type': 'AdministrativeArea', 'name': 'Chhatarpur' },
      { '@type': 'AdministrativeArea', 'name': 'Khajuraho' },
      { '@type': 'AdministrativeArea', 'name': 'Panna' },
      { '@type': 'AdministrativeArea', 'name': 'Tikamgarh' },
      { '@type': 'AdministrativeArea', 'name': 'Sagar' },
      { '@type': 'AdministrativeArea', 'name': 'Damoh' },
      { '@type': 'AdministrativeArea', 'name': 'Bundelkhand' },
      { '@type': 'AdministrativeArea', 'name': 'Madhya Pradesh' }
    ],
    'servesCuisine': [
      'North Indian',
      'Bundelkhandi',
      'Awadhi',
      'South Indian',
      'Mughlai',
      'Indian Fusion',
      'Continental'
    ],
    'sameAs': [
      FACEBOOK_URL,
      INSTAGRAM_URL
    ],
    'hasMap': `https://maps.google.com/?q=Maharastra+Marg+Rani+ki+Bagiya+Chhatarpur+MP+471001`,
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': COMPANY_PHONE,
      'contactType': 'reservations',
      'email': COMPANY_EMAIL,
      'availableLanguage': ['Hindi', 'English']
    },
    'currenciesAccepted': 'INR',
    'paymentAccepted': ['Cash', 'UPI', 'Bank Transfer', 'Cheque'],
    'foundingDate': '2018'
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    'url': SITE_URL,
    'name': COMPANY_NAME,
    'description': `${COMPANY_NAME} offers premium Indian wedding catering and event management services in Chhatarpur, Madhya Pradesh.`,
    'publisher': { '@id': `${SITE_URL}/#business` },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${SITE_URL}/?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(localBusiness)}</script>
      <script type="application/ld+json">{JSON.stringify(website)}</script>
    </Helmet>
  );
}
