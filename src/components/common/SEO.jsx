import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image,
  ogImage = '/logo.png', 
  type,
  ogType = 'website',
  canonicalUrl,
  schema
}) => {
  const siteName = 'DobleFalta';
  const fullTitle = title
    ? (title.includes('DobleFalta') ? title : `${title} | ${siteName}`)
    : `${siteName} - Resultados de Tenis En Vivo y ATP Rankings`;
  const defaultDescription = 'DobleFalta: resultados de tenis en vivo, crónicas de tenistas argentinos, ranking ATP y WTA actualizado, juegos interactivos y comunidad.';
  const metaDescription = description || defaultDescription;
  const domain = 'https://doblefaltatenis.com.ar';

  const chosenImage = image || ogImage || '/logo.png';
  const resolvedImage = chosenImage.startsWith('http') ? chosenImage : `${domain}${chosenImage}`;
  const resolvedType = type || ogType || 'website';
  const resolvedCanonical = canonicalUrl
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${domain}${canonicalUrl}`)
    : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={resolvedType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={resolvedImage} />
      {resolvedCanonical && <meta property="og:url" content={resolvedCanonical} />}
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={resolvedImage} />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}

      {/* Mobile Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#8b3318" />
    </Helmet>
  );
};

export default SEO;
