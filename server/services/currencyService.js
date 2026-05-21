import axios from 'axios';

let exchangeRatesCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

export const fetchExchangeRates = async () => {
  const now = Date.now();
  if (exchangeRatesCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
    return exchangeRatesCache;
  }

  try {
    const response = await axios.get('https://open.er-api.com/v6/latest/USD');
    if (response.data && response.data.rates) {
      exchangeRatesCache = response.data.rates;
      lastFetchTime = now;
      return exchangeRatesCache;
    }
  } catch (error) {
    console.error('Error fetching exchange rates:', error.message);
  }
  return null;
};

export const convertAmount = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  
  const rates = await fetchExchangeRates();
  if (!rates) {
    // Fallback if API fails: return original amount or throw error. We'll return original for safety.
    console.warn(`Cannot convert ${fromCurrency} to ${toCurrency}, using original amount.`);
    return amount;
  }

  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate) {
    console.warn(`Invalid currency provided: ${fromCurrency} or ${toCurrency}`);
    return amount;
  }

  // Convert to USD first (base), then to target currency
  const amountInUSD = amount / fromRate;
  const convertedAmount = amountInUSD * toRate;

  return Number(convertedAmount.toFixed(2));
};

export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY'];
