import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';
import { SITE_CONFIG } from './siteConfig';

const C = BUSINESS_CONTACT;

export const getAutoDealerSchema = (city?: string) => {
  const cityName = city || C.address.city;
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: `Richard Automotive - ${cityName}`,
    alternateName: 'Richard Automotive PR',
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/app-icon.webp`,
    image: `${SITE_CONFIG.url}/og-image.webp`,
    telephone: C.phone,
    email: C.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: cityName === C.address.city ? C.address.street : 'Puerto Rico',
      addressLocality: cityName,
      addressRegion: C.address.state,
      postalCode: cityName === C.address.city ? C.address.zip : undefined,
      addressCountry: C.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: cityName === C.address.city ? C.geo.latitude : cityName === 'Bayamón' ? 18.397 : C.geo.latitude,
      longitude: cityName === C.address.city ? C.geo.longitude : cityName === 'Bayamón' ? -66.1558 : C.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/richardautomotive',
      'https://www.instagram.com/richardautomotive',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: C.phone,
        contactType: 'sales',
        areaServed: 'PR',
        availableLanguage: ['Spanish', 'English'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '09:00',
          closes: '18:00',
        },
      },
    ],
    priceRange: '$$$',
    foundingDate: '2009',
    hasMap: 'https://maps.google.com/?cid=richard-automotive-vega-alta',
    paymentAccepted: ['Cash', 'Credit Card', 'Financing', 'Trade-In'],
    currenciesAccepted: 'USD',
    areaServed: {
      '@type': 'State',
      name: 'Puerto Rico',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '124',
      bestRating: '5',
      worstRating: '1',
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

export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${SITE_CONFIG.url}${item.url}`,
  })),
});

export const getHowToSchema = (steps: { name: string; text: string }[], name: string, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name,
  description,
  step: steps.map((step, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: step.name,
    text: step.text,
  })),
});

export const getQAPageSchema = (mainEntity: { name: string; acceptedAnswer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'QAPage',
  mainEntity: mainEntity.map((q) => ({
    '@type': 'Question',
    name: q.name,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.acceptedAnswer,
    },
  })),
});

export const getFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
});
