import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import ExchangeRatesList from '../components/ExchangeRatesList';
import * as cnbClient from '../services/cnbClient';

vi.mock('../services/cnbClient');

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

describe('ExchangeRatesList', () => {
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
        {
          country: 'EMU',
          currency: 'euro',
          amount: 1,
          code: 'EUR',
          rate: 24.5,
        },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the exchange rates list', async () => {
    renderWithQueryClient(<ExchangeRatesList />);

    await waitFor(() => {
      expect(screen.getByText('Exchange Rates')).toBeInTheDocument();
      expect(screen.getByText('Date: 25.12.2023 #249')).toBeInTheDocument();
      expect(screen.getByText('Australia')).toBeInTheDocument();
      expect(screen.getByText('dollar')).toBeInTheDocument();
      expect(screen.getByText('AUD')).toBeInTheDocument();
      expect(screen.getByText('15.1230')).toBeInTheDocument();
      expect(screen.getByText('0.066124')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    renderWithQueryClient(<ExchangeRatesList />);
    expect(screen.getByText('Loading exchange rates...')).toBeInTheDocument();
  });

  it('displays all rates in a table', async () => {
    renderWithQueryClient(<ExchangeRatesList />);

    await waitFor(() => {
      expect(screen.getByText('Australia')).toBeInTheDocument();
      expect(screen.getByText('EMU')).toBeInTheDocument();
      expect(screen.getByText('AUD')).toBeInTheDocument();
      expect(screen.getByText('EUR')).toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    mockFetchExchangeRates.mockRejectedValueOnce(new Error('API Error'));

    renderWithQueryClient(<ExchangeRatesList />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error loading exchange rates:/i)
      ).toBeInTheDocument();
    });
  });

  it('displays message when no rates are available', async () => {
    mockFetchExchangeRates.mockResolvedValueOnce({
      date: '25.12.2023 #249',
      rates: [],
    });

    renderWithQueryClient(<ExchangeRatesList />);

    await waitFor(() => {
      expect(screen.getByText('No exchange rates available.')).toBeInTheDocument();
    });
  });

  it('formats rates correctly with 4 decimal places', async () => {
    renderWithQueryClient(<ExchangeRatesList />);

    await waitFor(() => {
      expect(screen.getByText('15.1230')).toBeInTheDocument();
      expect(screen.getByText('24.5000')).toBeInTheDocument();
      expect(screen.getByText('0.066124')).toBeInTheDocument();
      expect(screen.getByText('0.040816')).toBeInTheDocument();
    });
  });
});
