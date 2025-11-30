import type { VercelRequest, VercelResponse } from '@vercel/node';

const CNB_API_URL =
  'https://www.cnb.cz/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/daily.txt';

interface ErrorResponse {
  error: string;
  message?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    const errorResponse: ErrorResponse = { error: 'Method not allowed' };
    return res.status(405).json(errorResponse);
  }

  try {
    const response = await fetch(CNB_API_URL, {
      headers: {
        'User-Agent': 'ForexCalc/1.0',
      },
    });

    if (!response.ok) {
      console.error(`CNB API error: ${response.status} ${response.statusText}`);
      const errorResponse: ErrorResponse = {
        error: `Failed to fetch from CNB: ${response.statusText}`,
      };
      return res.status(response.status).json(errorResponse);
    }

    const data = await response.text();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    return res.status(200).send(data);
  } catch (error) {
    console.error('Error fetching CNB data:', error);
    const errorResponse: ErrorResponse = {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
    return res.status(500).json(errorResponse);
  }
}
