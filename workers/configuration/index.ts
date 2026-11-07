import {submitConfiguration} from '../../lib/configurator/submission.ts';

type Env = {
  RESEND_API_KEY: string;
  RESEND_FROM: string;
  CONTACT_TO: string;
  TURNSTILE_SECRET_KEY: string;
  SITE_URL: string;
  CONFIGURATION_RATE_LIMITER: {limit: (options: {key: string}) => Promise<{success: boolean}>};
};

const configurationWorker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = new URL(env.SITE_URL).origin;
    const headers = {'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'};
    if (request.headers.get('origin') !== origin) return new Response('Forbidden', {status: 403, headers: {'Cache-Control': 'no-store'}});
    if (new URL(request.url).pathname !== '/configuration') return new Response('Not found', {status: 404, headers});
    if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers});
    if (request.method !== 'POST') return new Response('Method not allowed', {status: 405, headers: {...headers, Allow: 'POST, OPTIONS'}});
    if (!env.CONFIGURATION_RATE_LIMITER) return Response.json({error: 'Service unavailable'}, {status: 503, headers});
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const limit = await env.CONFIGURATION_RATE_LIMITER.limit({key: ip});
    if (!limit.success) return Response.json({error: 'Try again shortly'}, {status: 429, headers: {...headers, 'Retry-After': '60'}});
    const response = await submitConfiguration(request, {env, clientIp: ip});
    for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
    return response;
  }
};

export default configurationWorker;
