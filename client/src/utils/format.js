export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY'];

export const formatCurrency = (value = 0, currencyCode = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(value || 0);
};

export const getCurrencySymbol = (currencyCode = 'INR') => {
  const parts = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).formatToParts(0);
  return parts.find(part => part.type === 'currency')?.value || '₹';
};

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

export const categories = [
  'Salary',
  'Freelance',
  'Food',
  'Rent',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Education',
  'Investments',
  'Other'
]

export const paymentMethods = ['cash', 'card', 'bank_transfer', 'upi', 'wallet', 'other']
