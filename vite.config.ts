import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import type { ProxyOptions } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/cnb': {
        target: 'https://www.cnb.cz',
        changeOrigin: true,
        rewrite: (_path: string) =>
          '/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/daily.txt',
        configure: (proxy: any, _options: ProxyOptions) => {
          proxy.on('proxyReq', (proxyReq: any, req: any, _res: any) => {
            console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
          });
          proxy.on('error', (err: any, _req: any, _res: any) => {
            console.error('[Proxy] Error:', err.message);
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
