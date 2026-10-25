const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function response(origin, status, message) {
  return new Response(status === 204 ? null : JSON.stringify({ message }), {
    status,
    headers: {
      ...JSON_HEADERS,
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function digest(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function courseEmail(courseUrl) {
  const text = `Спасибо за интерес к курсу «Новая точка отсчета»!\n\nМатериалы курса доступны по ссылке:\n${courseUrl}\n\nСохраните это письмо, чтобы ссылка всегда была под рукой. Желаем спокойной и полезной работы с материалами.`;
  const html = `<!doctype html><html lang="ru"><body style="margin:0;background:#f4f8f3;color:#183d2b;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;padding:36px 24px"><p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase">Новая точка отсчета</p><h1 style="font-size:28px;font-weight:500;line-height:1.2">Спасибо за интерес к курсу!</h1><p style="font-size:16px;line-height:1.6">Материалы курса доступны по кнопке ниже.</p><p style="margin:28px 0"><a href="${courseUrl}" style="display:inline-block;padding:14px 20px;background:#34704f;color:#fff;text-decoration:none;border-radius:6px">Открыть материалы курса</a></p><p style="font-size:16px;line-height:1.6">Сохраните это письмо, чтобы ссылка всегда была под рукой. Желаем спокойной и полезной работы с материалами.</p></div></body></html>`;
  return { text, html };
}

export function createHandler(fetcher = fetch) {
  return async function handle(request, env) {
    const requestOrigin = request.headers.get('Origin') ?? '';
    const allowedOrigin = env.ALLOWED_ORIGIN ?? '';
    const url = new URL(request.url);

    if (url.pathname === '/health' && request.method === 'GET') {
      return new Response('ok', { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
    }
    if (url.pathname !== '/course-access') return new Response('Not found', { status: 404 });
    if (!allowedOrigin || requestOrigin !== allowedOrigin) return new Response('Forbidden', { status: 403 });
    if (request.method === 'OPTIONS') return response(allowedOrigin, 204, '');
    if (request.method !== 'POST') return response(allowedOrigin, 405, 'Используйте форму на сайте.');
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
      return response(allowedOrigin, 415, 'Неверный формат запроса.');
    }
    const declaredLength = Number(request.headers.get('Content-Length') ?? 0);
    if (declaredLength > 4096) return response(allowedOrigin, 413, 'Слишком большой запрос.');

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const ipKey = await digest(`ip:${ip}`);
    const ipLimit = await env.REQUEST_RATE_LIMITER.limit({ key: ipKey });
    if (!ipLimit.success) return response(allowedOrigin, 429, 'Слишком много попыток. Подождите минуту.');

    let body;
    try {
      const raw = await request.text();
      if (raw.length > 4096) return response(allowedOrigin, 413, 'Слишком большой запрос.');
      body = JSON.parse(raw);
    } catch {
      return response(allowedOrigin, 400, 'Неверный формат запроса.');
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
    if (body.website) return response(allowedOrigin, 400, 'Не удалось отправить форму.');
    if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
      return response(allowedOrigin, 400, 'Введите корректный email.');
    }
    if (!turnstileToken || turnstileToken.length > 2048) {
      return response(allowedOrigin, 400, 'Подтвердите, что вы не робот.');
    }
    if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY || !env.RESEND_FROM || !env.COURSE_URL) {
      return response(allowedOrigin, 503, 'Отправка временно недоступна. Попробуйте позже.');
    }

    const verificationBody = new FormData();
    verificationBody.set('secret', env.TURNSTILE_SECRET_KEY);
    verificationBody.set('response', turnstileToken);
    verificationBody.set('remoteip', ip);
    let verificationResponse;
    let verification;
    try {
      verificationResponse = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: verificationBody,
        signal: AbortSignal.timeout(10000),
      });
      verification = await verificationResponse.json().catch(() => ({}));
    } catch {
      return response(allowedOrigin, 502, 'Не удалось выполнить проверку безопасности. Попробуйте позже.');
    }
    if (!verificationResponse.ok || !verification.success || verification.hostname !== env.EXPECTED_HOSTNAME || verification.action !== 'course_delivery') {
      return response(allowedOrigin, 400, 'Проверка безопасности не пройдена. Обновите форму и попробуйте снова.');
    }

    const emailKey = await digest(`email:${email}`);
    const recipientLimit = await env.RECIPIENT_RATE_LIMITER.limit({ key: emailKey });
    if (!recipientLimit.success) return response(allowedOrigin, 429, 'Ссылка уже отправлялась. Проверьте почту или повторите через минуту.');

    const message = courseEmail(env.COURSE_URL);
    const windowKey = await digest(`${email}:${Math.floor(Date.now() / 600000)}`);
    let sendResponse;
    let sendResult;
    try {
      sendResponse = await fetcher('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `course-access-${windowKey}`,
        },
        body: JSON.stringify({
          from: env.RESEND_FROM,
          to: [email],
          subject: 'Ваш доступ к курсу «Новая точка отсчета»',
          text: message.text,
          html: message.html,
        }),
        signal: AbortSignal.timeout(15000),
      });
      sendResult = await sendResponse.json().catch(() => ({}));
    } catch {
      return response(allowedOrigin, 502, 'Почтовый сервис временно недоступен. Попробуйте позже.');
    }
    if (!sendResponse.ok || !sendResult.id) {
      return response(allowedOrigin, 502, 'Почтовый сервис не принял письмо. Попробуйте позже.');
    }

    return response(allowedOrigin, 200, 'Письмо отправлено. Проверьте входящие и папку «Спам».');
  };
}

const worker = { fetch: createHandler() };
export default worker;
