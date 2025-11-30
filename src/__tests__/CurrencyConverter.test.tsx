import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import CurrencyConverter from '../components/CurrencyConverter';
import * as cnbClient from '../services/cnbClient';

vi.mock('../services/cnbClient');

const mockFetchExchangeRates = vi.mocked(cnbClient.fetchExchangeRates);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  });

const renderWithQueryClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
  );
};

describe('CurrencyConverter', () => {
  beforeEach(() => {
    mockFetchExchangeRates.mockResolvedValue({
      date: '25.12.2023 #249',
      rates: [
        { country: 'Australia', currency: 'dollar', amount: 1, code: 'AUD', rate: 15.123 },
        { country: 'EMU', currency: 'euro', amount: 1, code: 'EUR', rate: 24.5 },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading then shows the form', async () => {
    renderWithQueryClient(<CurrencyConverter />);

    expect(screen.getByText('Loading exchange rates...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Currency Converter')).toBeInTheDocument();
      expect(screen.getByText('From')).toBeInTheDocument();
      expect(screen.getByText('To')).toBeInTheDocument();
    });
  });

  it('converts CZK to selected currency', async () => {
    renderWithQueryClient(<CurrencyConverter />);

    const amountInput = await screen.findAllByPlaceholderText('0.00');
    fireEvent.change(amountInput[0], { target: { value: '100' } });

    const dropdownButton = screen.getByRole('button', { name: /EUR/i });
    fireEvent.click(dropdownButton);

    const audOption = await screen.findByText('AUD');
    fireEvent.click(audOption);

    await waitFor(() => {
      expect(screen.getByText(/6,61/)).toBeInTheDocument();
      expect(screen.getAllByText('AUD').length).toBeGreaterThan(0);
    });
  });

  it('shows validation error for negative input', async () => {
    renderWithQueryClient(<CurrencyConverter />);

    const amountInput = await screen.findAllByPlaceholderText('0.00');
    fireEvent.change(amountInput[0], { target: { value: '-10' } });

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid positive number')).toBeInTheDocument();
    });
  });

  it('converts CZK to EUR correctly with proper math', async () => {
    renderWithQueryClient(<CurrencyConverter />);

    const amountInput = await screen.findAllByPlaceholderText('0.00');
    fireEvent.change(amountInput[0], { target: { value: '1000' } });

    await waitFor(() => {
      expect(screen.getByText(/40,82/)).toBeInTheDocument();
    });
  });

  it('handles currency with amount > 1 correctly (JPY)', async () => {
    mockFetchExchangeRates.mockResolvedValue({
      date: '25.12.2023 #249',
      rates: [
        { country: 'Japan', currency: 'yen', amount: 100, code: 'JPY', rate: 15.5 },
        { country: 'EMU', currency: 'euro', amount: 1, code: 'EUR', rate: 24.5 },
      ],
    });

    renderWithQueryClient(<CurrencyConverter />);

    const amountInput = await screen.findAllByPlaceholderText('0.00');
    fireEvent.change(amountInput[0], { target: { value: '1000' } });

    const dropdownButton = screen.getByRole('button', { name: /EUR/i });
    fireEvent.click(dropdownButton);
    const jpyOption = await screen.findByText('JPY');
    fireEvent.click(jpyOption);

    await waitFor(() => {
      const result = screen.getByText(/6\s*452/);
      expect(result).toBeInTheDocument();
    });
  });

  it('handles large numbers correctly', async () => {
    renderWithQueryClient(<CurrencyConverter />);

    const amountInput = await screen.findAllByPlaceholderText('0.00');
    fireEvent.change(amountInput[0], { target: { value: '1000000' } });

    await waitFor(() => {
      const result = screen.queryByText(/40\s*816/);
      expect(result).toBeInTheDocument();
    });
  });

  it('handles Infinity input by showing error', async () => {
    renderWithQueryClient(<CurrencyConverter />);

    const amountInput = await screen.findAllByPlaceholderText('0.00');
    fireEvent.change(amountInput[0], { target: { value: 'Infinity' } });

    await waitFor(() => {
      expect(screen.getByText('Calculation resulted in invalid number')).toBeInTheDocument();
    });
  });

  it('handles API failure gracefully', async () => {
    mockFetchExchangeRates.mockRejectedValueOnce(new Error('API Error'));

    renderWithQueryClient(<CurrencyConverter />);

    await waitFor(() => {
      expect(
        screen.getByText('Error loading exchange rates. Please try again later.')
      ).toBeInTheDocument();
    });
  });
});
