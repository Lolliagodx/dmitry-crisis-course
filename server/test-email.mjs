import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { createHash } from 'node:crypto';
export function emailConfig() {
  let local = {};
  try { local = parseEnv(readFileSync('.env.local', 'utf8')); } catch {}
  return { ...local, ...process.env };
}
export function createEmailHandler({ config = emailConfig, send = fetch, now = Date.now } = {}) {
  let nextAttempt = 0;
  let dailyCount = 0;
  let day = '';
  return async function emailHandler(req, res, next = () => res.writeHead(404).end()) {
    if ((req.url || '').split('?')[0] !== '/api/test-course') return next();
    const reply = (status, message) => { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify({message})); };
    if (req.method !== 'POST') { res.setHeader('Allow','POST'); return reply(405,'Используйте форму отправки.'); }
    const settings = config();
    const origin = settings.TEST_SITE_ORIGIN || 'http://localhost:3000';
    if (req.headers.origin !== origin) return reply(403,'Отправка доступна только с сайта.');
    if (!req.headers['content-type']?.startsWith('application/json')) return reply(415,'Неверный формат запроса.');
    if (!settings.RESEND_API_KEY || !settings.TEST_RECIPIENT_EMAIL) return reply(503,'Отправка ещё не подключена. Требуется настройка Resend.');
    let raw = '';
    try {
      for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw) > 2048) return reply(413,'Слишком большой запрос.'); }
      const body = JSON.parse(raw);
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400,'Введите корректный email.');
      if (email !== settings.TEST_RECIPIENT_EMAIL.trim().toLowerCase()) return reply(400,'В тестовом режиме доступна только почта, указанная при регистрации в Resend.');
      if (body.website) return reply(400,'Не удалось отправить форму.');
      const current = now();
      const today = new Date(current).toISOString().slice(0,10);
      if (day !== today) { day = today; dailyCount = 0; }
      if (current < nextAttempt || dailyCount >= 10) return reply(429,'Лимит тестовых отправок. Подождите минуту; максимум 10 попыток в сутки.');
      nextAttempt = current + 60000;
      dailyCount++;
      // One fixed recipient and fixed content: this endpoint cannot relay arbitrary mail.
      const idempotency = createHash('sha256').update(email + ':' + Math.floor(current / 60000)).digest('hex');
      const response = await send('https://api.resend.com/emails', {
        method:'POST', headers:{Authorization:`Bearer ${settings.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`course-test-${idempotency}`},
        body:JSON.stringify({from:'Курс Дмитрия <onboarding@resend.dev>',to:[email],subject:'Тестовый курс',text:'тестовый курс (здесь будет ссылка)'}), signal:AbortSignal.timeout(15000)
      });
      if (!response.ok) return reply(502,'Resend не принял письмо. Проверьте настройки аккаунта или попробуйте позже.');
      const result = await response.json();
      if (!result.id) return reply(502,'Сервис не подтвердил отправку.');
      return reply(200,'Письмо передано в Resend для отправки. Проверьте входящие и папку «Спам».');
    } catch (error) {
      if (error instanceof SyntaxError) return reply(400,'Неверный формат запроса.');
      return reply(502,'Не удалось подтвердить отправку. Подождите минуту перед повторной попыткой.');
    }
  };
}
