
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/constants/siteConfig';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    schema?: object | object[]; // JSON-LD structured data or array of objects
    noIndex?: boolean;
    noFollow?: boolean;
}

const SEO: React.FC<SEOProps> = ({
    title = "Richard Automotive | 2026 AI Command Center",
    description = SITE_CONFIG.description,
    image,
    url,
    type = "website",
    schema,
    noIndex = false,
    noFollow = false
}) => {
    const siteUrl = SITE_CONFIG.url;
    const normalizePath = (value?: string) => {
        if (!value) return `${siteUrl}/`;
        if (value.startsWith('http')) return value;
        if (value === '/') return `${siteUrl}/`;
        const prefixed = value.startsWith('/') ? value : `/${value}`;
        return `${siteUrl}${prefixed}`;
    };

    const defaultImage = SITE_CONFIG.seo.ogImage.startsWith('http')
        ? SITE_CONFIG.seo.ogImage
        : `${siteUrl}${SITE_CONFIG.seo.ogImage}`;
    const imageUrl = image
        ? (image.startsWith('http') ? image : `${siteUrl}${image}`)
        : defaultImage;
    const currentUrl = normalizePath(url);
    const fullTitle = title.includes("Richard Automotive") ? title : `${title} | Richard Automotive`;
    const robotsValue = `${noIndex ? 'noindex' : 'index'},${noFollow ? 'nofollow' : 'follow'},max-image-preview:large,max-snippet:-1,max-video-preview:-1`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={SITE_CONFIG.seo.keywords.join(', ')} />
            <meta name="robots" content={robotsValue} />
            <meta name="googlebot" content={robotsValue} />
            <link rel="canonical" href={currentUrl} />
            <link rel="alternate" hrefLang="es-PR" href={currentUrl} />
            <link rel="alternate" hrefLang="x-default" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:locale" content={SITE_CONFIG.seo.locale} />
            <meta property="og:site_name" content={SITE_CONFIG.name} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={currentUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />

            {/* Structured Data (JSON-LD) */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
