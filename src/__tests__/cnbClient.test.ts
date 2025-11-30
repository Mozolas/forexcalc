import { vi } from 'vitest';
import { fetchExchangeRates } from '../services/cnbClient';

global.fetch = vi.fn();

describe('cnbClient', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear();
  });

  it('should parse CNB exchange rate data correctly', async () => {
    const mockResponse = `25.12.2023 #249
Country|Currency|Amount|Code|Rate
Australia|dollar|1|AUD|15.123
Brazil|real|1|BRL|4.567
Canada|dollar|1|CAD|17.890`;

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => mockResponse,
    } as unknown as Response);

    const result = await fetchExchangeRates();

    expect(result.date).toBe('25.12.2023 #249');
    expect(result.rates).toHaveLength(3);
    expect(result.rates[0]).toEqual({
      country: 'Australia',
      currency: 'dollar',
      amount: 1,
      code: 'AUD',
      rate: 15.123,
    });
    expect(result.rates[1]).toEqual({
      country: 'Brazil',
      currency: 'real',
      amount: 1,
      code: 'BRL',
      rate: 4.567,
    });
    expect(result.rates[2]).toEqual({
      country: 'Canada',
      currency: 'dollar',
      amount: 1,
      code: 'CAD',
      rate: 17.89,
    });
  });

  it('should handle rates with comma as decimal separator', async () => {
    const mockResponse = `25.12.2023 #249
Country|Currency|Amount|Code|Rate
Euro|euro|1|EUR|24,500`;

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => mockResponse,
    } as unknown as Response);

    const result = await fetchExchangeRates();

    expect(result.rates[0].rate).toBe(24.5);
  });

  it('should throw error when no valid rates found', async () => {
    const mockResponse = `25.12.2023 #249
Country|Currency|Amount|Code|Rate
Invalid|data|here`;

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => mockResponse,
    } as unknown as Response);

    await expect(fetchExchangeRates()).rejects.toThrow('No valid exchange rates found');
  });

  it('should throw error when fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'Error details',
    } as unknown as Response);

    await expect(fetchExchangeRates()).rejects.toThrow('Failed to fetch exchange rates');
  });

  it('should filter out invalid lines', async () => {
    const mockResponse = `25.12.2023 #249
Country|Currency|Amount|Code|Rate
Australia|dollar|1|AUD|15.123
Invalid line
Canada|dollar|1|CAD|17.890
Another invalid|line|with|wrong|format|extra`;

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => mockResponse,
    } as unknown as Response);

    const result = await fetchExchangeRates();

    expect(result.rates).toHaveLength(2);
    expect(result.rates[0].code).toBe('AUD');
    expect(result.rates[1].code).toBe('CAD');
  });

  it('should throw error when fetch is rejected', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchExchangeRates()).rejects.toThrow('Network error');
  });
});
