import React from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { fetchExchangeRates } from '../services/cnbClient';
import { CNB_CONFIG } from '../config/constants';

const Container = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
`;

const HeaderSection = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--color-border);
`;

const Title = styled.h2`
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
`;

const DateInfo = styled.p`
  color: var(--color-secondary);
  font-size: 0.875rem;
  margin: 0;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: var(--color-bg);
`;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--color-border);

  &:hover {
    background: var(--color-bg);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableHeaderCell = styled.th<{ $alignRight?: boolean }>`
  padding: 1rem 1.5rem;
  text-align: ${props => props.$alignRight ? 'right' : 'left'};
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-secondary);
`;

const TableCell = styled.td`
  padding: 1rem 1.5rem;
  color: var(--color-text);
  font-size: 0.875rem;
`;

const CountryCell = styled(TableCell)`
  font-weight: 500;
`;

const CurrencySub = styled.div`
  font-size: 0.75rem;
  color: var(--color-secondary);
  margin-top: 0.25rem;
`;

const CodeCell = styled(TableCell)`
  font-weight: 600;
  font-family: monospace;
`;

const RateCell = styled(TableCell)`
  font-weight: 600;
  font-family: monospace;
  text-align: right;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--color-secondary);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #c00;
  background: #fee;
  border: 1px solid #fcc;
  margin: 1rem;
  border-radius: 4px;
`;

const ExchangeRatesList: React.FC = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: fetchExchangeRates,
    staleTime: CNB_CONFIG.CACHE_TIME,
  });

  const formatRate = (value: number, digits: number) =>
    Number.isFinite(value) ? value.toFixed(digits) : '—';

  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>Loading exchange rates...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return (
      <Container>
        <ErrorMessage>
          Error loading exchange rates: {errorMessage}
        </ErrorMessage>
      </Container>
    );
  }

  if (!data?.rates || data.rates.length === 0) {
    return (
      <Container>
        <ErrorMessage>No exchange rates available.</ErrorMessage>
      </Container>
    );
  }

  const normalizedRates = data.rates.map(rate => {
    const normalizedRate = rate.amount ? rate.rate / rate.amount : NaN;
    const reverseRate = Number.isFinite(normalizedRate) && normalizedRate !== 0 ? 1 / normalizedRate : NaN;
    return {
      ...rate,
      normalizedRate,
      reverseRate,
    };
  });

  return (
    <Container>
      <HeaderSection>
        <Title>Exchange Rates</Title>
        <DateInfo>Date: {data.date}</DateInfo>
      </HeaderSection>
      <TableWrapper>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>Country & Currency</TableHeaderCell>
              <TableHeaderCell>Code</TableHeaderCell>
              <TableHeaderCell $alignRight>Rate (CZK)</TableHeaderCell>
              <TableHeaderCell $alignRight>Per 1 CZK</TableHeaderCell>
            </tr>
          </TableHeader>
          <tbody>
            {normalizedRates.map((rate) => (
              <TableRow key={rate.code}>
                <CountryCell>
                  {rate.country}
                  <CurrencySub>{rate.currency}</CurrencySub>
                </CountryCell>
                <CodeCell>{rate.code}</CodeCell>
                <RateCell>{formatRate(rate.normalizedRate, 4)}</RateCell>
                <RateCell>{formatRate(rate.reverseRate, 6)}</RateCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </Container>
  );
};

export default ExchangeRatesList;
