import { Helmet } from 'react-helmet-async';
import { COMPANY_EMAIL, COMPANY_PHONE, COMPANY_ADDRESS, COMPANY_NAME } from '../config/env';

export default function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CateringService',
    '@id': 'https://evengcatering.com/#catering-service',
    'name': COMPANY_NAME,
    'image': [
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'
    ],
    'telephone': COMPANY_PHONE,
    'email': COMPANY_EMAIL,
    'url': 'https://evengcatering.com',
    'priceRange': '₹₹₹₹',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Chhatarpur',
      'addressLocality': 'Chhatarpur',
      'addressRegion': 'Madhya Pradesh',
      'postalCode': '471001',
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 24.9064,
      'longitude': 79.5873
    },
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ],
        'opens': '08:00',
        'closes': '22:00'
      }
    ],
    'areaServed': [
      { '@type': 'AdministrativeArea', 'name': 'Chhatarpur' },
      { '@type': 'AdministrativeArea', 'name': 'Khajuraho' },
      { '@type': 'AdministrativeArea', 'name': 'Panna' },
      { '@type': 'AdministrativeArea', 'name': 'Tikamgarh' },
      { '@type': 'AdministrativeArea', 'name': 'Sagar' },
      { '@type': 'AdministrativeArea', 'name': 'Damoh' },
      { '@type': 'AdministrativeArea', 'name': 'Satna' },
      { '@type': 'AdministrativeArea', 'name': 'Rewa' },
      { '@type': 'AdministrativeArea', 'name': 'Jhansi' },
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
    'description': `${COMPANY_NAME} offers premium Indian wedding catering, grand celebration banquets, and bespoke live food station solutions for luxury events across Chhatarpur, Bundelkhand, and Madhya Pradesh.`
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
