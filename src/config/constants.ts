export const CNB_CONFIG = {
  DIRECT_URL:
    'https://www.cnb.cz/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/daily.txt',
  PROXY_PATH: '/api/cnb',
  CACHE_TIME: 1000 * 60 * 60 * 24,
} as const;

export const THEME = {
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1440px',
  },
} as const;

export const CURRENCY_CONFIG = {
  zeroDecimalCurrencies: ['JPY', 'KRW', 'VND', 'CLP', 'ISK'],
  threeDecimalCurrencies: ['BHD', 'JOD', 'KWD', 'OMR', 'TND'],
  defaultDecimalPlaces: 2,
} as const;
