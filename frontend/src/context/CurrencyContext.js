import React, { createContext, useState, useContext, useEffect } from 'react';
import { convertPrice, formatPrice, getCurrencySymbol } from '../utils/currency';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'SGD');

  useEffect(() => {
    // Listen for currency changes from header
    const handleCurrencyChange = () => {
      const newCurrency = localStorage.getItem('currency') || 'SGD';
      setCurrency(newCurrency);
    };

    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    window.dispatchEvent(new Event('currencyChange'));
  };

  const convertAndFormat = (priceInSGD) => {
    const converted = convertPrice(priceInSGD, currency);
    return formatPrice(converted, currency);
  };

  const convertOnly = (priceInSGD) => {
    return convertPrice(priceInSGD, currency);
  };

  const value = {
    currency,
    changeCurrency,
    convertAndFormat,
    convertOnly,
    currencySymbol: getCurrencySymbol(currency)
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
