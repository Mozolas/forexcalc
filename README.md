# CNB Exchange Rates

React application for displaying Czech National Bank exchange rates and currency conversion.

## Tech Stack
- React, TypeScript, Styled Components, React Query

## Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start local server:
   ```bash
   pnpm dev
   ```

3. Run tests:
   ```bash
   pnpm test
   ```

## Deployment
 
Optimized for Vercel. This project uses a serverless function to proxy requests to the CNB API, solving CORS issues.
 
1. Install Vercel CLI (optional):
   ```bash
   pnpm add -g vercel
   ```
 
2. Deploy:
   ```bash
   vercel
   ```
 
The `vercel.json` configuration handles the routing for the API proxy.
