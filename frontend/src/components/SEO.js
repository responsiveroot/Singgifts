import React from 'react';
import { Helmet } from 'react-helmet';

function SEO({ 
  title, 
  description, 
  keywords, 
  image, 
  url,
  type = 'website',
  schema 
}) {
  const siteName = 'SingGifts';
  const defaultDescription = 'Premium Singaporean gifts and souvenirs. Discover authentic products celebrating Singapore\'s culture and heritage.';
  const defaultImage = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&h=630&fit=crop';
  const baseUrl = window.location.origin;
  
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const fullDescription = description || defaultDescription;
  const fullImage = image || defaultImage;
  const fullUrl = url ? `${baseUrl}${url}` : window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={fullDescription} />
      <meta property="twitter:image" content={fullImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

export default SEO;