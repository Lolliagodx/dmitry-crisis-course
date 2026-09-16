'use client';

import { useState, type SubmitEvent } from 'react';

export default function TestEmail() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Тестовый режим: письмо не отправляется');
  }
  return <div className="test-email">
    <button className="button" type="button" aria-expanded={open} aria-controls="test-course-form" onClick={() => { setOpen(!open); setMessage(''); }}>Покупка скоро откроется <span aria-hidden="true">{open ? '−' : '+'}</span></button>
    <small>Можно попробовать форму. Оплата и отправка писем отключены.</small>
    {open && <form id="test-course-form" onSubmit={submit}>
      <label htmlFor="test-email-address">Ваш email</label>
      <input id="test-email-address" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" onChange={() => setMessage('')} />
      <button className="button button-outline" type="submit">Проверить форму</button>
      <output className="email-status" aria-live="polite">{message}</output>
    </form>}
  </div>;
}

