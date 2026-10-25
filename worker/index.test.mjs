import assert from 'node:assert/strict';
import test from 'node:test';
import { createHandler } from './index.mjs';

const origin = 'https://lolliagodx.github.io';
const courseUrl = 'https://drive.google.com/drive/folders/1_IVqxYQXvLwIlyV4_MU6OIMJNsprQOkW?usp=sharing';

function limiter(success = true) {
  return { limit: async () => ({ success }) };
}

function environment(overrides = {}) {
  return {
    ALLOWED_ORIGIN: origin,
    EXPECTED_HOSTNAME: 'lolliagodx.github.io',
    COURSE_URL: courseUrl,
    RESEND_FROM: 'Курс <course@example.com>',
    RESEND_API_KEY: 'test-resend-key',
    TURNSTILE_SECRET_KEY: 'test-turnstile-key',
    REQUEST_RATE_LIMITER: limiter(),
    RECIPIENT_RATE_LIMITER: limiter(),
    ...overrides,
  };
}

function request(body, requestOrigin = origin) {
  return new Request('https://worker.example/course-access', {
    method: 'POST',
    headers: { Origin: requestOrigin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.7' },
    body: JSON.stringify(body),
  });
}

test('rejects requests from another origin before external calls', async () => {
  let calls = 0;
  const handle = createHandler(async () => { calls += 1; return new Response(); });
  const result = await handle(request({ email: 'buyer@example.com' }, 'https://attacker.example'), environment());
  assert.equal(result.status, 403);
  assert.equal(calls, 0);
});

test('requires a valid address, honeypot and Turnstile token', async () => {
  const handle = createHandler(async () => { throw new Error('must not call'); });
  assert.equal((await handle(request({ email: 'invalid', turnstileToken: 'token' }), environment())).status, 400);
  assert.equal((await handle(request({ email: 'buyer@example.com', website: 'spam', turnstileToken: 'token' }), environment())).status, 400);
  assert.equal((await handle(request({ email: 'buyer@example.com' }), environment())).status, 400);
});

test('validates Turnstile and sends only fixed course content', async () => {
  let emailPayload;
  const handle = createHandler(async (url, options) => {
    if (url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
      return Response.json({ success: true, hostname: 'lolliagodx.github.io', action: 'course_delivery' });
    }
    emailPayload = JSON.parse(options.body);
    return Response.json({ id: 'email-id' });
  });
  const result = await handle(request({ email: 'BUYER@example.com', turnstileToken: 'valid-token', ignored: 'untrusted' }), environment());
  assert.equal(result.status, 200);
  assert.deepEqual(emailPayload.to, ['buyer@example.com']);
  assert.equal(emailPayload.from, 'Курс <course@example.com>');
  assert.match(emailPayload.text, new RegExp(courseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(emailPayload.text, /untrusted/);
});

test('enforces request and recipient rate limits', async () => {
  const external = async (url) => url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
    ? Response.json({ success: true, hostname: 'lolliagodx.github.io', action: 'course_delivery' })
    : Response.json({ id: 'email-id' });
  const handle = createHandler(external);
  assert.equal((await handle(request({ email: 'buyer@example.com', turnstileToken: 'token' }), environment({ REQUEST_RATE_LIMITER: limiter(false) }))).status, 429);
  assert.equal((await handle(request({ email: 'buyer@example.com', turnstileToken: 'token' }), environment({ RECIPIENT_RATE_LIMITER: limiter(false) }))).status, 429);
});
