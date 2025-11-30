import styled from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import ExchangeRatesList from './components/ExchangeRatesList';
import CurrencyConverter from './components/CurrencyConverter';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const MainBox = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const Header = styled.header`
  text-align: center;
  padding: 2rem;
  border-bottom: 1px solid var(--color-border);
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--color-secondary);
`;

function App() {
  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <MainBox>
          <Header>
            <Title>ForexCalc</Title>
            <Subtitle>Exchange Rates & Currency Converter</Subtitle>
          </Header>
          <CurrencyConverter />
        </MainBox>
        <ExchangeRatesList />
      </AppContainer>
    </>
  );
}

export default App;
