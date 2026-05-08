import type {NextRequest} from 'next/server';
import {siteConfig} from '@/config/site';

export const runtime = 'nodejs';

const PROJECT_TYPES = ['webapp', 'internalTool', 'landing', 'other'] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ESCAPE_MAP: Record<string, string> = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ESCAPE_MAP[c]);

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;

  const body = new URLSearchParams({secret, response: token});
  if (ip) body.set('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body
  });
  if (!res.ok) return false;
  const data = (await res.json()) as {success?: boolean};
  return data.success === true;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({error: 'Invalid JSON'}, {status: 400});
  }

  // Honeypot — humans never fill this, bots usually do. Pretend success so they don't retry.
  const honeypot = typeof body.website === 'string' ? body.website : '';
  if (honeypot.trim() !== '') {
    return Response.json({ok: true});
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const projectType = typeof body.projectType === 'string' ? body.projectType.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';

  if (!name || name.length > 200) {
    return Response.json({error: 'Invalid name'}, {status: 400});
  }
  if (!email || email.length > 200 || !EMAIL_RE.test(email)) {
    return Response.json({error: 'Invalid email'}, {status: 400});
  }
  if (!PROJECT_TYPES.includes(projectType as (typeof PROJECT_TYPES)[number])) {
    return Response.json({error: 'Invalid project type'}, {status: 400});
  }
  if (!message || message.length > 5000) {
    return Response.json({error: 'Invalid message'}, {status: 400});
  }

  if (process.env.TURNSTILE_SECRET_KEY) {
    const ip =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      null;
    const ok = await verifyTurnstile(turnstileToken, ip);
    if (!ok) {
      return Response.json({error: 'Captcha verification failed'}, {status: 400});
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not set');
    return Response.json({error: 'Email service not configured'}, {status: 500});
  }

  const from = process.env.RESEND_FROM ?? 'GG Software <onboarding@resend.dev>';
  const to = process.env.CONTACT_TO ?? siteConfig.email;

  const html = `
    <h2>New contact form submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Project type:</strong> ${escapeHtml(projectType)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: `New inquiry from ${name} (${projectType})`,
      html
    })
  });

  if (!resendRes.ok) {
    const errText = await resendRes.text().catch(() => '');
    console.error('[contact] Resend send failed', resendRes.status, errText);
    return Response.json({error: 'Failed to send message'}, {status: 502});
  }

  return Response.json({ok: true});
}
