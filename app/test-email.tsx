'use client';

import { useEffect, useRef, useState, type SubmitEvent } from 'react';

const API_URL = process.env.NEXT_PUBLIC_COURSE_DELIVERY_API_URL?.trim() ?? '';
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? '';

type TurnstileApi = {
  ready: (callback: () => void) => void;
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstileScript: Promise<TurnstileApi> | undefined;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileScript) return turnstileScript;

  turnstileScript = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-course-turnstile]');
    const script = existing ?? document.createElement('script');
    const complete = () => window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile unavailable'));
    script.addEventListener('load', complete, { once: true });
    script.addEventListener('error', () => reject(new Error('Turnstile failed to load')), { once: true });
    if (!existing) {
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.courseTurnstile = 'true';
      document.head.appendChild(script);
    }
  });

  return turnstileScript;
}

export default function CourseDeliveryForm() {
  const configured = Boolean(API_URL && TURNSTILE_SITE_KEY);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const widgetContainer = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !configured || !widgetContainer.current) return;
    let active = true;

    loadTurnstile()
      .then((turnstile) => turnstile.ready(() => {
        if (!active || !widgetContainer.current || widgetId.current) return;
        widgetId.current = turnstile.render(widgetContainer.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: 'course_delivery',
          theme: 'light',
          size: 'flexible',
          callback: (value: string) => { setToken(value); setMessage(''); },
          'expired-callback': () => setToken(''),
          'error-callback': () => { setToken(''); setMessage('Не удалось пройти проверку. Обновите страницу и попробуйте снова.'); },
        });
      }))
      .catch(() => setMessage('Не удалось загрузить защиту формы. Проверьте соединение и обновите страницу.'));

    return () => {
      active = false;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [configured, open]);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || !token || sending) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const emailValue = form.get('email');
    const websiteValue = form.get('website');
    const email = typeof emailValue === 'string' ? emailValue.trim() : '';
    const website = typeof websiteValue === 'string' ? websiteValue : '';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    setSending(true);
    setMessage('Отправляем письмо…');
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, turnstileToken: token }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message || 'Не удалось отправить письмо. Попробуйте позже.');
      setSent(true);
      setMessage(result.message || 'Письмо отправлено. Проверьте входящие и папку «Спам».');
      formElement.reset();
    } catch (error) {
      setMessage(error instanceof Error && error.name !== 'AbortError'
        ? error.message
        : 'Сервис не ответил вовремя. Попробуйте ещё раз через минуту.');
    } finally {
      window.clearTimeout(timeout);
      setSending(false);
      setToken('');
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    }
  }

  return <div className="test-email">
    <button className="button" type="button" aria-expanded={open} aria-controls="course-delivery-form" onClick={() => { setOpen(!open); setMessage(''); }}>
      Получить курс на email <span aria-hidden="true">{open ? '−' : '+'}</span>
    </button>
    <small>Оплата пока не подключена. Ссылка на курс придёт в письме.</small>
    {open && !configured && <output className="email-status">Выдача курса по email готовится к запуску.</output>}
    {open && configured && <form id="course-delivery-form" onSubmit={submit}>
      <label htmlFor="course-email-address">Ваш email</label>
      <input id="course-email-address" name="email" type="email" required maxLength={254} autoComplete="email" inputMode="email" placeholder="you@example.com" disabled={sending || sent} onChange={() => setMessage('')} />
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="course-website">Сайт</label>
        <input id="course-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {!sent && <div className="turnstile-slot" ref={widgetContainer} />}
      {!sent && <button className="button button-outline" type="submit" disabled={!token || sending}>{sending ? 'Отправляем…' : 'Отправить ссылку'}</button>}
      <output className="email-status" aria-live="polite">{message}</output>
    </form>}
  </div>;
}
