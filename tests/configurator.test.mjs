import test from 'node:test';
import assert from 'node:assert/strict';
import {createConfiguration, parseConfiguration, encodeConfiguration, decodeConfiguration, templateIds, palettes, contrastRatio, onColor} from '../lib/configurator/config.ts';
import {submitConfiguration} from '../lib/configurator/submission.ts';
import worker from '../workers/configuration/index.ts';

const env = {SITE_URL: 'https://ggsoftware.cz', RESEND_API_KEY: 'test-key', RESEND_FROM: 'Website <test@example.com>', CONTACT_TO: 'info@ggsoftware.cz', TURNSTILE_SECRET_KEY: 'test-secret'};
const sample = () => ({name: 'Test Customer', email: 'customer@example.com', notes: 'A test enquiry', locale: 'cs', configuration: createConfiguration('savor'), requestId: '01234567-1234-4123-8123-123456789012', turnstileToken: 'test-token'});
const request = (body = sample(), headers = {}) => new Request('https://ggsoftware.cz/api/configuration', {method: 'POST', headers: {'Content-Type': 'application/json', origin: env.SITE_URL, ...headers}, body: JSON.stringify(body)});
const verify = {success: true, hostname: 'ggsoftware.cz', action: 'configuration'};
function fakeFetch(results = [verify, {id: 'test-email'}]) {
  const calls = [];
  return {calls, fetcher: async (...args) => {calls.push(args); const value = results.shift(); if (value instanceof Error) throw value; return value instanceof Response ? value : Response.json(value);}};
}

test('every preset is valid and has readable text and buttons', () => {
  for (const template of templateIds) {
    assert.deepEqual(parseConfiguration(createConfiguration(template)), createConfiguration(template));
    for (const palette of palettes[template]) {
      assert.ok(contrastRatio(palette.text, palette.background) >= 4.5);
      assert.ok(contrastRatio(onColor(palette.accent), palette.accent) >= 4.5);
    }
  }
});
test('custom accent colors always get readable button text', () => {
  for (let value = 0; value <= 255; value++) {const hex = '#' + value.toString(16).padStart(2, '0').repeat(3); assert.ok(contrastRatio(hex, onColor(hex)) >= 4.5);}
});
test('Unicode content survives sharing; extra properties are stripped', () => {
  const config = createConfiguration('atelier');
  config.content.name = 'Žluťoučký kůň 🐎';
  config.content.headline = '<script>alert(1)</script>';
  assert.deepEqual(decodeConfiguration(encodeConfiguration(config)), config);
  assert.deepEqual(parseConfiguration({...config, email: 'private@example.com'}), config);
  assert.equal(encodeConfiguration(config).includes('private@example'), false);
});
test('untrusted links and configuration values are rejected', () => {
  const config = createConfiguration('forma');
  for (const change of [{template: '__proto__'}, {font: 'url(https://evil)'}, {image: '../../secret'}, {accent: 'url(javascript:alert(1))'}, {spacing: -1}, {radius: 500}, {fontSize: NaN}, {imagePosition: 101}, {sections: null}, {content: {...config.content, name: 'x'.repeat(51)}}, {content: {...config.content, name: '\u0000bad'}}]) assert.equal(parseConfiguration({...config, ...change}), null);
  for (const value of ['!', 'a'.repeat(5001), btoa('null'), btoa('{}')]) assert.equal(decodeConfiguration(value), null);
});
test('successful delivery includes validated design, locale, reply-to, attachment and reproducible link', async () => {
  const transport = fakeFetch();
  const response = await submitConfiguration(request(), {env, ...transport});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {ok: true, id: 'test-email'});
  assert.equal(transport.calls.length, 2);
  assert.equal(transport.calls[0][0], 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  const [, options] = transport.calls[1];
  const payload = JSON.parse(options.body);
  assert.deepEqual(payload.to, ['info@ggsoftware.cz']);
  assert.equal(payload.reply_to, 'customer@example.com');
  assert.match(payload.text, /Language: cs/);
  assert.match(payload.text, /https:\/\/ggsoftware.cz\/cs\/configure#design=/);
  assert.equal(payload.html, undefined);
  assert.deepEqual(JSON.parse(Buffer.from(payload.attachments[0].content, 'base64').toString()), sample().configuration);
  assert.equal(options.headers['Idempotency-Key'], `configuration/${sample().requestId}`);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
test('origin, JSON shape, oversized input and invalid enquiries never contact a provider', async () => {
  const cases = [[request(sample(), {origin: 'https://evil.example'}), 403], [request(sample(), {'Content-Type': 'text/plain'}), 415], [request(null), 400], [request([]), 400], [request({...sample(), name: '\r\nBcc: victim@example.com'}), 400], [request({...sample(), email: 'bad'}), 400], [request({...sample(), requestId: 'not-a-uuid'}), 400], [request({...sample(), notes: 'x'.repeat(16001)}), 413], [request({...sample(), configuration: {...sample().configuration, width: 99999}}), 400]];
  for (const [req, status] of cases) {const transport = fakeFetch(); assert.equal((await submitConfiguration(req, {env, ...transport})).status, status); assert.equal(transport.calls.length, 0);}
});
test('honeypot is discarded without sending', async () => {
  const transport = fakeFetch(); const response = await submitConfiguration(request({...sample(), website: 'bot'}), {env, ...transport});
  assert.equal(response.status, 200); assert.equal(transport.calls.length, 0);
});
test('production fails closed when secrets or sender are missing', async () => {
  for (const key of ['RESEND_API_KEY', 'RESEND_FROM', 'TURNSTILE_SECRET_KEY']) {const transport = fakeFetch(); assert.equal((await submitConfiguration(request(), {env: {...env, [key]: undefined}, ...transport})).status, 503); assert.equal(transport.calls.length, 0);}
});
test('verification failure, wrong hostname/action, and timeout cannot send an email', async () => {
  for (const result of [{success: false}, {...verify, hostname: 'evil.example'}, {...verify, action: 'login'}, new Error('timeout')]) {
    const transport = fakeFetch([result]); const response = await submitConfiguration(request(), {env, ...transport});
    assert.ok([400, 502].includes(response.status)); assert.equal(transport.calls.length, 1);
  }
});
test('email failure or missing provider id is not reported as success', async () => {
  for (const result of [new Response('failure', {status: 500}), new Error('timeout'), {}]) {const transport = fakeFetch([verify, result]); const response = await submitConfiguration(request(), {env, ...transport}); assert.equal(response.status, 502);}
});
test('development can use a stub transport without a Turnstile secret', async () => {
  const transport = fakeFetch([{id: 'development-test'}]);
  assert.equal((await submitConfiguration(request(), {env: {...env, TURNSTILE_SECRET_KEY: undefined}, allowUnverifiedDevelopment: true, ...transport})).status, 200);
});
test('static-host Worker rejects cross-origin, missing limiter and excessive requests', async () => {
  const req = () => new Request('https://example.workers.dev/configuration', {method: 'POST', headers: {origin: env.SITE_URL, 'Content-Type': 'application/json'}, body: JSON.stringify(sample())});
  const denied = await worker.fetch(new Request('https://example.workers.dev/configuration', {headers: {origin: 'https://evil.example'}}), env);
  assert.equal(denied.status, 403);
  assert.equal((await worker.fetch(req(), env)).status, 503);
  const rateEnv = {...env, CONFIGURATION_RATE_LIMITER: {limit: async () => ({success: false})}};
  const limited = await worker.fetch(req(), rateEnv);
  assert.equal(limited.status, 429); assert.equal(limited.headers.get('Access-Control-Allow-Origin'), env.SITE_URL);
  const preflight = await worker.fetch(new Request('https://example.workers.dev/configuration', {method: 'OPTIONS', headers: {origin: env.SITE_URL}}), rateEnv);
  assert.equal(preflight.status, 204); assert.equal(preflight.headers.get('Access-Control-Allow-Headers'), 'Content-Type');
});
