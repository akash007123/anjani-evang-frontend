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
      'streetAddress': COMPANY_ADDRESS.split(',')[0] || COMPANY_ADDRESS,
      'addressLocality': 'Beverly Hills',
      'addressRegion': 'CA',
      'postalCode': '90210',
      'addressCountry': 'US'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 18.9256,
      'longitude': 72.8242
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
      {
        '@type': 'AdministrativeArea',
        'name': 'Los Angeles'
      },
      {
        '@type': 'AdministrativeArea',
        'name': 'Beverly Hills'
      },
      {
        '@type': 'AdministrativeArea',
        'name': 'Orange County'
      },
      {
        '@type': 'AdministrativeArea',
        'name': 'California'
      }
    ],
    'servesCuisine': [
      'North Indian',
      'Awadhi',
      'South Indian',
      'Mughlai',
      'Indian Fusion',
      'Continental'
    ],
    'description': `${COMPANY_NAME} offers premium Indian wedding catering, grand corporate gala banquets, and bespoke live food station solutions for luxury events across California.`
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
