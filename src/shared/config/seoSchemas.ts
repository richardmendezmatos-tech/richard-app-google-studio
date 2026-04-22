import { SITE_CONFIG } from './siteConfig';

export const getAutoDealerSchema = (city?: string) => {
  const cityName = city || 'Vega Alta';
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
      streetAddress:
        cityName === 'Vega Alta'
          ? 'Carr. #2 KM 28.5, Bo. Espinosa'
          : cityName === 'Bayamón'
            ? 'Bayamón'
            : 'Puerto Rico',
    },
    geo:
      cityName === 'Vega Alta' || cityName === 'Bayamón'
        ? {
            '@type': 'GeoCoordinates',
            latitude: cityName === 'Vega Alta' ? 18.4069 : 18.397,
            longitude: cityName === 'Vega Alta' ? -66.3533 : -66.1558,
          }
        : undefined,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: [SITE_CONFIG.social.facebook, SITE_CONFIG.social.instagram].filter(Boolean) as string[],
    priceRange: '$$$',
    areaServed: {
      '@type': 'State',
      name: 'Puerto Rico',
    },
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
      urlTemplate: `${SITE_CONFIG.url}/?s={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});
