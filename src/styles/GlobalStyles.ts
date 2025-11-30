import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    --color-bg: #f5f5f5;
    --color-surface: #ffffff;
    --color-text: #333333;
    --color-secondary: #666666;
    --color-accent: #0066cc;
    --color-border: #dddddd;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-bg: #1a1a1a;
      --color-surface: #2a2a2a;
      --color-text: #e0e0e0;
      --color-secondary: #999999;
      --color-accent: #4d9fff;
      --color-border: #444444;
    }
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: var(--color-bg);
    color: var(--color-text);
    line-height: 1.6;
  }

  #root {
    min-height: 100vh;
  }
`;

export default GlobalStyles;
