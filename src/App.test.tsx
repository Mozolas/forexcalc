import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import App from './App';
import * as cnbClient from './services/cnbClient';

// Mock the API client
vi.mock('./services/cnbClient');

const mockFetchExchangeRates = vi.mocked(cnbClient.fetchExchangeRates);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithQueryClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
  );
};

describe('App', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockFetchExchangeRates.mockResolvedValue({
      date: '25.12.2023 #249',
      rates: [
        {
          country: 'Australia',
          currency: 'dollar',
          amount: 1,
          code: 'AUD',
          rate: 15.123,
        },
      ],
    });
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('renders the main title', () => {
    renderWithQueryClient(<App />);
    expect(screen.getByText('ForexCalc')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderWithQueryClient(<App />);
    expect(screen.getByText('Exchange Rates & Currency Converter')).toBeInTheDocument();
  });

  it('renders CurrencyConverter component', () => {
    renderWithQueryClient(<App />);
    expect(screen.getByText('Currency Converter')).toBeInTheDocument();
  });

  it('renders ExchangeRatesList component', async () => {
    renderWithQueryClient(<App />);
    await waitFor(() => {
      expect(screen.getByText('Exchange Rates')).toBeInTheDocument();
    });
  });
});
