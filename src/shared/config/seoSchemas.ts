import { SITE_CONFIG } from './siteConfig';

export const getAutoDealerSchema = (city?: string) => {
  const cityName = city || 'Bayamón';
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: `Richard Automotive - ${cityName}`,
    alternateName: 'Richard Automotive PR',
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/app-icon.png`,
    image: `${SITE_CONFIG.url}/og-image.png`,
    telephone: SITE_CONFIG.contact.phone,
    email: SITE_CONFIG.contact.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressRegion: 'PR',
      addressCountry: 'US',
       streetAddress: cityName === 'Bayamón' ? 'Villa Contessa' : cityName === 'Vega Alta' ? 'Carr. #2' : 'Puerto Rico',
    },
    geo: (cityName === 'Bayamón' || cityName === 'Vega Alta') ? {
      '@type': 'GeoCoordinates',
      latitude: cityName === 'Bayamón' ? 18.3970 : 18.4124,
      longitude: cityName === 'Bayamón' ? -66.1558 : -66.3313
    } : undefined,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00'
      }
    ],
    sameAs: [
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.instagram
    ].filter(Boolean) as string[],
    priceRange: '$$$',
    areaServed: {
      '@type': 'State',
      name: 'Puerto Rico'
    }
  };
};

export const getWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_CONFIG.url}/?s={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
});
