import {parseConfiguration, configurationSummary, encodeConfiguration, templateNames} from './config.ts';

type EmailEnvironment = {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  CONTACT_TO?: string;
  TURNSTILE_SECRET_KEY?: string;
  SITE_URL: string;
};
export type SubmissionOptions = {
  env: EmailEnvironment;
  fetcher?: typeof fetch;
  allowUnverifiedDevelopment?: boolean;
  clientIp?: string;
};
const MAX_BODY = 16000;
const EMAIL = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
function reply(status: number, body: Record<string, unknown>) {
  return Response.json(body, {status, headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}});
}
async function readBody(request: Request): Promise<unknown> {
  if (Number(request.headers.get('content-length')) > MAX_BODY) throw new RangeError('Body too large');
  if (!request.body) throw new SyntaxError('Missing body');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) { await reader.cancel(); throw new RangeError('Body too large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes));
}

export async function submitConfiguration(request: Request, options: SubmissionOptions): Promise<Response> {
  const {env, fetcher = fetch} = options;
  if (request.method !== 'POST') return reply(405, {error: 'Method not allowed'});
  const site = new URL(env.SITE_URL);
  if (request.headers.get('origin') !== site.origin) return reply(403, {error: 'Origin not allowed'});
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply(415, {error: 'Expected JSON'});
  let body: unknown;
  try { body = await readBody(request); }
  catch (error) { return reply(error instanceof RangeError ? 413 : 400, {error: 'Invalid request'}); }
  if (!record(body)) return reply(400, {error: 'Invalid request'});
  if (typeof body.website === 'string' && body.website.trim()) return reply(200, {ok: true, id: 'filtered'});
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
  const config = parseConfiguration(body.configuration);
  if (!config || !name || name.length > 100 || /[\r\n\u0000-\u001f]/.test(String(body.name)) ||
      email.length > 200 || !EMAIL.test(email) || /[\r\n]/.test(String(body.email)) || notes.length > 2000 ||
      (body.notes !== undefined && typeof body.notes !== 'string') ||
      (body.locale !== 'cs' && body.locale !== 'en') || typeof body.requestId !== 'string' || !UUID.test(body.requestId) || token.length > 2048) {
    return reply(400, {error: 'Invalid enquiry'});
  }
  if (!env.RESEND_API_KEY || !env.RESEND_FROM || (!env.TURNSTILE_SECRET_KEY && !options.allowUnverifiedDevelopment)) {
    return reply(503, {error: 'Email service unavailable'});
  }
  try {
    if (env.TURNSTILE_SECRET_KEY) {
      if (!token) return reply(400, {error: 'Verification required'});
      const verificationBody = new URLSearchParams({secret: env.TURNSTILE_SECRET_KEY, response: token});
      if (options.clientIp) verificationBody.set('remoteip', options.clientIp);
      const verification = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', body: verificationBody, signal: AbortSignal.timeout(8000)
      });
      if (!verification.ok) return reply(502, {error: 'Verification unavailable'});
      const verified: unknown = await verification.json();
      if (!record(verified) || verified.success !== true || verified.hostname !== site.hostname || verified.action !== 'configuration') {
        return reply(400, {error: 'Verification failed'});
      }
    }
    const preview = `${site.origin}/${body.locale}/configure#design=${encodeConfiguration(config)}`;
    const content = [
      `Website configuration enquiry — ${templateNames[config.template]}`,
      `Name: ${name}`, `Email: ${email}`, `Language: ${body.locale}`,
      '', configurationSummary(config), '', 'Additional notes:', notes || '(none)', '', `Open the design: ${preview}`
    ].join('\n');
    const attachment = btoa(Array.from(new TextEncoder().encode(JSON.stringify(config, null, 2)), byte => String.fromCharCode(byte)).join(''));
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(12000),
      headers: {'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `configuration/${body.requestId}`},
      body: JSON.stringify({from: env.RESEND_FROM, to: [env.CONTACT_TO || 'info@ggsoftware.cz'], reply_to: email,
        subject: `Website enquiry: ${templateNames[config.template]} — ${name}`, text: content,
        attachments: [{filename: `gg-${config.template}-design.json`, content: attachment, content_type: 'application/json'}]})
    });
    if (!response.ok) return reply(502, {error: 'Email delivery failed'});
    const result: unknown = await response.json();
    if (!record(result) || typeof result.id !== 'string' || !result.id) return reply(502, {error: 'Email delivery unconfirmed'});
    return reply(200, {ok: true, id: result.id});
  } catch { return reply(502, {error: 'Email service unavailable'}); }
}
