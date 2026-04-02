import React from 'react';
import Script from 'next/script';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import telemetry from '@/shared/api/metrics/analytics';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object | object[];
  keywords?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Richard Automotive | Compra y Vende en PR',
  description = SITE_CONFIG.description,
  image,
  url,
  type = 'website',
  schema,
  keywords,
  noIndex = false,
  noFollow = false,
}) => {
  React.useEffect(() => {
    // Telemetry disabled temporarily to unblock dashboard rendering
  }, [title]);

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
  const imageUrl = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;
  const currentUrl = normalizePath(url);
  const fullTitle = title.includes('Richard Automotive') ? title : `${title} | Richard Automotive`;
  const robotsValue = `${noIndex ? 'noindex' : 'index'},${noFollow ? 'nofollow' : 'follow'},max-image-preview:large,max-snippet:-1,max-video-preview:-1`;

  return (
    <>
      {schema && (
        <Script
          id="seo-schema-fsd"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </>
  );
};

export default SEO;
