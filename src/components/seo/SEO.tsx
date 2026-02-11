
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
}

const SEO: React.FC<SEOProps> = ({
    title = "Richard Automotive | 2026 AI Command Center",
    description = SITE_CONFIG.description,
    image,
    url,
    type = "website",
    schema
}) => {
    const siteUrl = SITE_CONFIG.url;
    const defaultImage = SITE_CONFIG.seo.ogImage.startsWith('http')
        ? SITE_CONFIG.seo.ogImage
        : `${siteUrl}${SITE_CONFIG.seo.ogImage}`;
    const imageUrl = image || defaultImage;
    const currentUrl = url ? `${siteUrl}${url}` : siteUrl;
    const fullTitle = title.includes("Richard Automotive") ? title : `${title} | Richard Automotive`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={SITE_CONFIG.seo.keywords.join(', ')} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={imageUrl} />

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
