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
    };
}

export const SITE_CONFIG: SiteConfig = {
    name: 'Richard Automotive',
    domain: 'richard-automotive.com',
    url: 'https://www.richard-automotive.com',
    description: 'Autos seminuevos certificados en Puerto Rico. Financiamiento disponible, trade-in, y la mejor selección de SUVs, sedanes y pickups.',
    social: {
        facebook: 'https://www.facebook.com/richardautomotive1',
        instagram: 'https://www.instagram.com/richardoneal_/',
    },
    contact: {
        phone: '+1 (787) 368-2880',
        whatsapp: '17873682880',
        email: 'richard@richard-automotive.com',
        address: 'San Juan, Puerto Rico',
    },
    seo: {
        keywords: [
            'autos seminuevos puerto rico',
            'carros usados san juan',
            'financiamiento autos pr',
            'trade in puerto rico',
            'suv seminuevos',
            'richard automotive',
            'autos certificados pr'
        ],
        ogImage: '/og-image.png'
    }
};
