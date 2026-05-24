export interface SiteConfig {
  name: string;
  domain: string;
  url: string;
  description: string;
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
  };
  seo: {
    keywords: string[];
    ogImage: string;
    locale: string;
  };
}

export const SITE_CONFIG: SiteConfig = {
  name: 'Richard Automotive',
  domain: 'richard-automotive.com',
  url: 'https://www.richard-automotive.com',
  description:
    'Tu dealer líder de autos nuevos Ford y usados certificados en Puerto Rico. Richard Automotive en Vega Alta ofrece financiamiento inteligente, trade-in y selección curada con IA.',
  social: {
    facebook: 'https://www.facebook.com/richardautomotive1',
    instagram: 'https://www.instagram.com/richardoneal_/',
  },
  contact: {
    phone: '787-368-2880',
    whatsapp: '17873682880',
    email: 'ventas@richard-automotive.com',
    address: 'Carr. #2 KM 28.5, Bo. Espinosa, Vega Alta, PR 00692',
  },
  seo: {
    keywords: [
      'autos nuevos ford puerto rico',
      'autos nuevos bayamon puerto rico',
      'ford puerto rico nuevos',
      'autos usados puerto rico',
      'carros usados san juan pr',
      'dealer de autos puerto rico',
      'financiamiento de autos pr',
      'trade in bayamon pr',
      'carros de lujo bayamon',
      'richard automotive',
      'autos certificados pr',
    ],
    ogImage: '/og-image.png',
    locale: 'es_PR',
  },
};
