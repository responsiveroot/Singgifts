// Structured Data (Schema.org) helpers

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SingGifts",
  "url": window.location.origin,
  "logo": `${window.location.origin}/logo.png`,
  "description": "Premium Singaporean gifts and souvenirs",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "SG",
    "addressLocality": "Singapore"
  },
  "sameAs": [
    "https://facebook.com/singgifts",
    "https://instagram.com/singgifts"
  ]
};

export const createProductSchema = (product) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.images,
  "sku": product.sku,
  "offers": {
    "@type": "Offer",
    "price": product.sale_price || product.price,
    "priceCurrency": "SGD",
    "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "url": `${window.location.origin}/products/${product.id}`
  },
  "aggregateRating": product.review_count > 0 ? {
    "@type": "AggregateRating",
    "ratingValue": product.rating,
    "reviewCount": product.review_count
  } : undefined
});

export const createBreadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `${window.location.origin}${item.url}`
  }))
});

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SingGifts",
  "url": window.location.origin,
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${window.location.origin}/products?search={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};