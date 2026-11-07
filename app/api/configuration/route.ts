import {submitConfiguration} from '@/lib/configurator/submission';
import {siteConfig} from '@/config/site';

export const runtime = 'nodejs';

// Development/server deployment adapter. GitHub Pages uses the Worker adapter instead.
const attempts = new Map<string, {count: number; reset: number}>();
export async function POST(request: Request) {
  const now = Date.now();
  for (const [key, value] of attempts) if (value.reset < now) attempts.delete(key);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const entry = attempts.get(ip) || {count: 0, reset: now + 60000};
  if (entry.count >= 5 || attempts.size > 10000) return Response.json({error: 'Try again shortly'}, {status: 429, headers: {'Retry-After': '60', 'Cache-Control': 'no-store'}});
  entry.count += 1; attempts.set(ip, entry);
  const development = process.env.NODE_ENV === 'development';
  return submitConfiguration(request, {
    env: {RESEND_API_KEY: process.env.RESEND_API_KEY, RESEND_FROM: process.env.RESEND_FROM,
      CONTACT_TO: process.env.CONTACT_TO || siteConfig.email, TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
      SITE_URL: development ? new URL(request.url).origin : siteConfig.url},
    allowUnverifiedDevelopment: development,
    // Configure the production reverse proxy to overwrite forwarding headers and enforce edge rate limits.
    clientIp: ip === 'unknown' ? undefined : ip
  });
}
