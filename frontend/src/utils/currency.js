// Currency conversion rates (base: SGD)
const EXCHANGE_RATES = {
  SGD: 1.0,
  USD: 0.74,
  EUR: 0.68,
  GBP: 0.58,
  AUD: 1.14,
  MYR: 3.45,
  INR: 61.50
};

const CURRENCY_SYMBOLS = {
  SGD: 'S$',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  MYR: 'RM',
  INR: '₹'
};

export const convertPrice = (priceInSGD, targetCurrency) => {
  const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
  return (priceInSGD * rate).toFixed(2);
};

export const formatPrice = (price, currency) => {
  const symbol = CURRENCY_SYMBOLS[currency] || 'S$';
  return `${symbol}${price}`;
};

export const getCurrencySymbol = (currency) => {
  return CURRENCY_SYMBOLS[currency] || 'S$';
};

export const getExchangeRate = (currency) => {
  return EXCHANGE_RATES[currency] || 1.0;
};
