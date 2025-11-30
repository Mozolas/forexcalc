import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { fetchExchangeRates } from '../services/cnbClient';
import SearchableDropdown from './SearchableDropdown';
import { CNB_CONFIG, CURRENCY_CONFIG } from '../config/constants';
import { media } from '../styles/theme';

const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: var(--color-text);
`;

const ConverterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1rem;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const InputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--color-secondary);
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--color-surface);
  color: var(--color-text);
  height: 48px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  &:read-only {
    background: var(--color-bg);
    cursor: not-allowed;
  }
`;

const CurrencyCode = styled.div`
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  background: var(--color-surface);
  color: var(--color-text);
  min-width: 80px;
  height: 48px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SwitchButton = styled.button`
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  cursor: pointer;
  min-width: 48px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);

  &:hover {
    border-color: var(--color-accent);
    background: var(--color-bg);
  }

  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  svg {
    width: 24px;
    height: 24px;
    stroke: currentColor;
  }

  ${media.mobile} {
    align-self: center;
  }
`;

const ResultContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResultValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
`;

const CopyButton = styled.button`
  padding: 0.5rem 1rem;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 0.8;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background: #fee;
  color: #c00;
  border: 1px solid #fcc;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--color-secondary);
`;

const InputWithCurrency = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
`;

const CurrencyConverter: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: fetchExchangeRates,
    staleTime: CNB_CONFIG.CACHE_TIME,
  });

  const [isReversed, setIsReversed] = useState(false);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [currencyCode, setCurrencyCode] = useState<string>('EUR');

  // Get decimal places for currency
  const getDecimalPlaces = (code: string): number => {
    if ((CURRENCY_CONFIG.zeroDecimalCurrencies as readonly string[]).includes(code)) return 0;
    if ((CURRENCY_CONFIG.threeDecimalCurrencies as readonly string[]).includes(code)) return 3;
    return CURRENCY_CONFIG.defaultDecimalPlaces;
  };

  // Calculate conversion (derived state via useMemo for better performance)
  const conversionResult = useMemo(() => {
    if (!fromAmount || !currencyCode || !data?.rates) {
      return { toAmount: '', error: '' };
    }

    const rate = data.rates.find((r) => r.code === currencyCode);
    if (!rate) {
      return { toAmount: '', error: 'Selected currency not found' };
    }

    const cleanedInput = fromAmount.trim().replace(/,/g, '.');
    const numericAmount = Number.parseFloat(cleanedInput);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return { toAmount: '', error: 'Please enter a valid positive number' };
    }

    const ratePerUnit = rate.rate / rate.amount;
    let result: number;

    if (isReversed) {
      result = numericAmount * ratePerUnit;
    } else {
      result = numericAmount / ratePerUnit;
    }

    if (!Number.isFinite(result)) {
      return { toAmount: '', error: 'Calculation resulted in invalid number' };
    }

    const targetCode = isReversed ? 'CZK' : currencyCode;
    const decimals = getDecimalPlaces(targetCode);

    return { toAmount: result.toFixed(decimals), error: '' };
  }, [fromAmount, currencyCode, isReversed, data]);

  const { toAmount, error: conversionError } = conversionResult;

  const handleSwitch = () => {
    // Just reverse the direction, keep the same input number
    setIsReversed(prev => !prev);
  };

  const handleCopy = async () => {
    if (!toAmount) return;
    try {
      await navigator.clipboard.writeText(toAmount);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Title>Currency Converter</Title>
        <LoadingMessage>Loading exchange rates...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Currency Converter</Title>
        <ErrorMessage>
          Error loading exchange rates. Please try again later.
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Currency Converter</Title>
      <ConverterWrapper>
        <InputRow>
          <InputGroup>
            <Label>From</Label>
            {isReversed ? (
              <>
                <SearchableDropdown
                  options={data?.rates || []}
                  value={currencyCode}
                  onChange={setCurrencyCode}
                  placeholder="Select currency..."
                />
                <Input
                  type="text"
                  inputMode="decimal"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                />
              </>
            ) : (
              <InputWithCurrency>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ flex: 1 }}
                />
                <CurrencyCode>CZK</CurrencyCode>
              </InputWithCurrency>
            )}
          </InputGroup>

          <SwitchButton onClick={handleSwitch}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </SwitchButton>

          <InputGroup>
            <Label>To</Label>
            {isReversed ? (
              <InputWithCurrency>
                <Input
                  type="text"
                  value={toAmount}
                  readOnly
                  placeholder="0.00"
                  style={{ flex: 1 }}
                />
                <CurrencyCode>CZK</CurrencyCode>
              </InputWithCurrency>
            ) : (
              <SearchableDropdown
                options={data?.rates || []}
                value={currencyCode}
                onChange={setCurrencyCode}
                placeholder="Select currency..."
              />
            )}
          </InputGroup>
        </InputRow>

        {conversionError && <ErrorMessage>{conversionError}</ErrorMessage>}

        {toAmount && !conversionError && (
          <ResultContainer>
            <ResultValue>
              {Number.parseFloat(toAmount).toLocaleString('cs-CZ')} {isReversed ? 'CZK' : currencyCode}
            </ResultValue>
            <CopyButton onClick={handleCopy}>Copy</CopyButton>
          </ResultContainer>
        )}
      </ConverterWrapper>
    </Container>
  );
};

export default CurrencyConverter;
