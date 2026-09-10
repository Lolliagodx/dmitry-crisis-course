'use client';
import {useState, type FormEvent} from 'react';
export default function TestEmail(){
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [success,setSuccess]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;
    const data=new FormData(event.currentTarget);setBusy(true);setMessage('');setSuccess(false);
    try{
      const endpoint = process.env.NEXT_PUBLIC_TEST_EMAIL_ENDPOINT;
      if(!endpoint){setMessage('Тестовая отправка доступна в локальной версии. Для этого адреса почтовый обработчик ещё не подключён.');return;}
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:data.get('email'),website:data.get('website')}),signal:AbortSignal.timeout(20000)});
      const result=await response.json() as {message?:string};
      setSuccess(response.ok);setMessage(result.message || 'Не удалось отправить письмо.');
    }catch{setMessage('Не удалось связаться с сервером. Подождите минуту и попробуйте снова.');}
    finally{setBusy(false);}
  }
  return <div className="test-email"><button className="button" type="button" aria-expanded={open} aria-controls="test-course-form" onClick={()=>setOpen(!open)}>Покупка скоро откроется <span aria-hidden="true">{open?'−':'+'}</span></button><small>Пока можно отправить бесплатное тестовое письмо.</small>{open&&<form id="test-course-form" onSubmit={submit}><label htmlFor="test-email-address">Email для тестового письма</label><input autoFocus id="test-email-address" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Почта аккаунта Resend" disabled={busy}/><p className="test-hint">Без домена письмо доступно только на адрес регистрации в Resend. Текст: «тестовый курс (здесь будет ссылка)». Адрес передаётся Resend для отправки одного письма.</p><div hidden><label htmlFor="test-website">Сайт</label><input id="test-website" name="website" tabIndex={-1} autoComplete="off"/></div><button className="button" type="submit" disabled={busy}>{busy?'Отправляем…':'Отправить тестовое письмо'}</button><p className={success?'email-status success':'email-status'} role="status" aria-live="polite">{message}</p></form>}</div>
}

