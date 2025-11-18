import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 4 Measurement ID (update in .env)
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    // Load gtag script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false // We'll send manually
    });
  }
};

// Track page view
export const trackPageView = (url, title) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: url,
      page_title: title
    });
  }
};

// Track custom event
export const trackEvent = (action, category, label, value) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

// E-commerce tracking
export const trackProductView = (product) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      currency: 'SGD',
      value: product.sale_price || product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category_id,
        price: product.sale_price || product.price
      }]
    });
  }
};

export const trackAddToCart = (product, quantity = 1) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_cart', {
      currency: 'SGD',
      value: (product.sale_price || product.price) * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category_id,
        price: product.sale_price || product.price,
        quantity: quantity
      }]
    });
  }
};

export const trackBeginCheckout = (cartItems, total) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      currency: 'SGD',
      value: total,
      items: cartItems.map(item => ({
        item_id: item.product.id,
        item_name: item.product.name,
        price: item.product.sale_price || item.product.price,
        quantity: item.cart_item.quantity
      }))
    });
  }
};

export const trackPurchase = (transactionId, total, items) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      currency: 'SGD',
      value: total,
      items: items
    });
  }
};

export const trackSearch = (searchTerm) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'search', {
      search_term: searchTerm
    });
  }
};

// Analytics Hook - Auto-track page views
export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);
};

export default function Analytics() {
  useAnalytics();
  return null;
}
