import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage = '/og-image.jpg', 
  ogType = 'website',
  canonicalUrl
}) => {
  const siteName = 'Doble Falta Tenis';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'Doble Falta: La comunidad de tenis más grande de Argentina. Resultados en vivo, ranking ATP actualizado, juegos de tenis y foro de debate.';
  const metaDescription = description || defaultDescription;
  const domain = 'https://doble-falta.web.app'; // O el dominio final oficial

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={`${domain}${canonicalUrl}`} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={`${domain}${ogImage}`} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={`${domain}${ogImage}`} />

      {/* Mobile Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#1a2e35" />
    </Helmet>
  );
};

export default SEO;
