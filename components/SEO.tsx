
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    schema?: object; // JSON-LD structured data
}

const SEO: React.FC<SEOProps> = ({
    title = "Richard Automotive | 2026 AI Command Center",
    description = "Don't just buy a car. Upgrade your lifestyle. Access our AI Command Center now.",
    image = "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1200&auto=format&fit=crop", // Futuristic car default
    url,
    type = "website",
    schema
}) => {
    const siteUrl = "https://richard-automotive.web.app";
    const currentUrl = url ? `${siteUrl}${url}` : siteUrl;
    const fullTitle = title.includes("Richard Automotive") ? title : `${title} | Richard Automotive`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={currentUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

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
