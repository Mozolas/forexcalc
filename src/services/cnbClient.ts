import { CNB_CONFIG } from '../config/constants';

export interface ExchangeRate {
  country: string;
  currency: string;
  amount: number;
  code: string;
  rate: number;
}

export interface CNBResponse {
  date: string;
  rates: ExchangeRate[];
}

/**
 * Parses CNB text response into structured data
 * Format: https://www.cnb.cz/en/faq/Format-of-the-foreign-exchange-market-rates/
 * Expected header: Country|Currency|Amount|Code|Rate
 */
const parseResponse = (text: string): CNBResponse => {
  if (!text || text.trim().length === 0) {
    throw new Error('Empty response from CNB server');
  }

  const lines = text
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line !== '');

  if (lines.length < 3) {
    console.error('Invalid CNB response format. First 500 chars:', text.substring(0, 500));
    throw new Error(`Invalid CNB response format. Expected at least 3 lines (date, header, data), received ${lines.length} lines`);
  }

  // Validate date line (first line)
  const date = lines[0] || '';

  // Validate header line (second line)
  const headerLine = lines[1];
  if (!headerLine?.includes('|')) {
    throw new Error(`Invalid CNB header format. Expected pipe-separated header, got: ${headerLine?.substring(0, 100)}`);
  }

  const headers = headerLine.split('|').map(h => h.trim().toLowerCase());

  // Find column indices dynamically
  const countryIdx = headers.findIndex(h => h === 'country');
  const currencyIdx = headers.findIndex(h => h === 'currency');
  const amountIdx = headers.findIndex(h => h === 'amount');
  const codeIdx = headers.findIndex(h => h === 'code');
  const rateIdx = headers.findIndex(h => h === 'rate');

  if (countryIdx === -1 || currencyIdx === -1 || amountIdx === -1 || codeIdx === -1 || rateIdx === -1) {
    throw new Error(`Invalid CNB header. Expected columns: Country, Currency, Amount, Code, Rate. Got: ${headerLine}`);
  }

  const rates: ExchangeRate[] = lines
    .slice(2)
    .map((line: string) => {
      const parts = line.split('|');

      if (parts.length < Math.max(countryIdx, currencyIdx, amountIdx, codeIdx, rateIdx) + 1) {
        console.warn(`Skipping invalid line (not enough columns): ${line}`);
        return null;
      }

      const amount = Number.parseInt(parts[amountIdx], 10);
      const rate = Number.parseFloat(parts[rateIdx].replace(',', '.'));

      if (!Number.isFinite(amount) || !Number.isFinite(rate) || amount <= 0 || rate <= 0) {
        console.warn(`Skipping invalid line (invalid numbers): ${line}`);
        return null;
      }

      return {
        country: parts[countryIdx].trim(),
        currency: parts[currencyIdx].trim(),
        amount,
        code: parts[codeIdx].trim(),
        rate,
      };
    })
    .filter((rate: ExchangeRate | null): rate is ExchangeRate => rate !== null);

  if (rates.length === 0) {
    throw new Error('No valid exchange rates found in CNB response');
  }

  return { date, rates };
};

/**
 * Fetches and parses exchange rates from Czech National Bank API via proxy
 * Format: https://www.cnb.cz/en/faq/Format-of-the-foreign-exchange-market-rates/
 */
export const fetchExchangeRates = async (): Promise<CNBResponse> => {
  try {
    const response = await fetch(CNB_CONFIG.PROXY_PATH);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to fetch exchange rates: ${response.status} ${response.statusText}${
          errorText ? ` - ${errorText.substring(0, 100)}` : ''
        }`
      );
    }

    const text = await response.text();
    return parseResponse(text);
  } catch (error) {
    console.error('Failed to fetch exchange rates from proxy:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};
