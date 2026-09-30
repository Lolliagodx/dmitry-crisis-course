import TestEmail from './test-email';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, UserRound, FileText, Leaf } from 'lucide-react';

const situations = [
  ['01', 'Всё вроде нормально. Но радости нет.', 'Работа, дела, привычный распорядок. Вы справляетесь, но всё чаще спрашиваете себя: «Неужели теперь всегда будет так?»'],
  ['02', 'На всех хватает сил. На себя — нет.', 'Вы стараетесь быть хорошим партнёром, сотрудником, родителем. А собственные желания снова откладываете на потом.'],
  ['03', 'Хочется перемен. Непонятно, с чего начать.', 'Советов много, мыслей ещё больше. Вы пробуете что-то изменить, но возвращаетесь к привычному и откладываете решение.'],
];

const questions = [
  ['01', 'Нужно ли заранее знать, чего я хочу?', 'Нет. Курс рассчитан в том числе на ситуацию, когда трудно разобраться в своих желаниях. Вопросы и письменные задания помогают начать этот разговор с собой.'],
  ['02', 'Это только видео или нужно что-то делать?', 'В курсе есть практики и домашние задания для самостоятельной работы. Смотреть материалы можно, но смысл участия — пробовать задания в своей жизни.'],
  ['03', 'Мне нужно изменить сразу всю жизнь?', 'Нет. Можно начать с того, что сейчас беспокоит больше всего, и выбрать посильное действие. Вам не нужно решать все вопросы одновременно.'],
  ['04', 'Где узнать стоимость и условия участия?', 'Условия участия и оплата пока не опубликованы. Сейчас на сайте доступна только тестовая форма: она не отправляет email и не оформляет покупку.'],
];

function Brand() {
  return <a className="brand course-brand" href="#course" aria-label="К началу страницы"><svg className="course-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M49 38a23 23 0 1 1-23-29" stroke="currentColor" strokeWidth="2" /><path d="M32 32 53 11M39 11h14v14" stroke="currentColor" strokeWidth="2" /><circle cx="32" cy="32" r="5" fill="currentColor" /></svg><span className="course-wordmark">ЛИЧНЫЙ ПУТЬ<span>КУРСЫ И ПРАКТИКИ</span></span></a>;
}

export default function Home() {
  return <>
    <a className="skip" href="#course">Перейти к содержанию</a>
    <header className="header">
      <Brand />
      <nav aria-label="Основное меню"><a href="#about">Об авторе</a><a href="#program">Курсы</a><a href="#questions">Вопросы</a></nav>
      <div className="header-end"><div className="social-space" aria-hidden="true" /><a className="small-cta" href="#purchase">Участие <ArrowUpRight size={17} /></a></div>
    </header>
    <main>
      <section className="personal-hero" id="course" aria-labelledby="author-name">
        <div className="personal-hero-inner wrap">
          <div className="personal-hero-ring" aria-hidden="true" />
          <div className="personal-hero-photo"><Image unoptimized src={`${process.env.GITHUB_PAGES === 'true' ? '/dmitry-crisis-course' : ''}/dmitry-davydov-hero.webp`} width="1122" height="1402" alt="Дмитрий Давыдов" fetchPriority="high" /></div>
          <blockquote className="personal-hero-quote"><span aria-hidden="true">“</span><p>Перемены начинаются<br />с честного разговора<br />с самим собой.</p></blockquote>
          <div className="personal-hero-copy">
            <p className="personal-hero-eyebrow">ЛИЧНЫЙ ОПЫТ / КУРСЫ / ПРАКТИКИ</p>
            <h1 id="author-name">Дмитрий<br /><em>Давыдов</em></h1>
            <p className="personal-hero-role">Автор курса о личностных переменах</p>
            <p className="personal-hero-description">Помогает разобраться в себе, услышать собственные желания и сделать первый шаг к переменам через личный опыт, практики и самостоятельную работу.</p>
            <div className="personal-hero-actions"><a className="button" href="#about">Об авторе <ArrowRight size={23} /></a><a className="button button-outline" href="#program">Посмотреть курс <ArrowRight size={23} /></a></div>
            <ul className="personal-hero-features"><li><span className="feature-icon"><UserRound size={28} strokeWidth={1.6} /></span><span>Личный<br />опыт</span></li><li><span className="feature-icon"><FileText size={28} strokeWidth={1.6} /></span><span>Практические<br />задания</span></li><li><span className="feature-icon"><Leaf size={28} strokeWidth={1.6} /></span><span>Мягкий<br />понятный подход</span></li></ul>
          </div>
        </div>
      </section>
      <section className="approach" id="approach"><div className="wrap section">
        <div className="section-heading"><div><span className="eyebrow">01 / ЗНАКОМОЕ ЧУВСТВО</span><h2>«Я так больше не хочу».<br /><em>А как хочу — не знаю.</em></h2></div><p className="heading-note">Иногда дело не в одном большом событии. Просто всё чаще замечаете, что в собственной жизни вам не хватает места для себя.</p></div>
        <div className="approach-grid">{situations.map(([n, title, copy]) => <article key={n}><span className="step">{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <div className="pain-next"><p>Если узнали себя, можно начать с простого: разобраться, что вас не устраивает и что вы готовы сделать иначе.</p><a className="text-cta" href="#program">Посмотреть курс <ArrowUpRight size={18} /></a></div>
      </div></section>
      <section className="section wrap author author-information" id="about">
        <div className="author-copy" aria-hidden="true"><div className="author-bottom"><div className="social-space" /></div></div>
      </section>
      <section className="section wrap program course-offer" id="program">
        <div><span className="eyebrow">02 / КУРСЫ</span><h2>Когда хочется<br /><em>что-то изменить.</em></h2><p className="muted">Начните с курса о личностном кризисе — если привычные ориентиры больше не помогают и хочется понять, как двигаться дальше.</p></div>
        <article className="course-summary"><span className="eyebrow">ОНЛАЙН-КУРС · САМОСТОЯТЕЛЬНАЯ РАБОТА</span><h3>Как выйти из<br /><em>личностного кризиса</em></h3><p className="muted">Для тех, кто устал жить на автомате, потерял интерес к привычным делам или слишком долго откладывает себя на потом.</p><ul className="course-benefits"><li><strong>Понять, чего хотите именно вы.</strong><span>Отделить собственные желания от чужих ожиданий.</span></li><li><strong>Замечать, на что уходят силы.</strong><span>Обратить внимание на привычки, эмоции и отношения.</span></li><li><strong>Перейти от размышлений к действиям.</strong><span>Выбрать небольшие шаги, которые можно пробовать в обычной жизни.</span></li></ul><a className="button" href="#purchase">Узнать об участии <ArrowUpRight size={20} /></a><p className="hero-note">Практики и задания, к которым можно возвращаться.</p></article>
      </section>
      <section className="section wrap program questions" id="questions"><div><span className="eyebrow">03 / ПЕРЕД УЧАСТИЕМ</span><h2>Если пока<br /><em>есть вопросы.</em></h2><p className="muted">Необязательно приходить с готовым планом. Достаточно желания уделить внимание себе и попробовать задания.</p></div><div className="topic-list">{questions.map(([n, title, copy]) => <details key={n}><summary><span>{n}</span><h3>{title}</h3><span className="plus" aria-hidden="true">+</span></summary><div className="topic-content"><p>{copy}</p></div></details>)}</div></section>
      <section className="wrap purchase" id="purchase"><div><span className="eyebrow">04 / УЧАСТИЕ</span><h2>Начните с себя.<br /><em>С одного решения.</em></h2><p>Необязательно знать, как будет выглядеть вся ваша жизнь дальше. Можно начать с того, чтобы услышать собственные желания и выбрать первый посильный шаг.</p><div className="purchase-meta" aria-hidden="true" /></div><div className="purchase-card"><span className="kicker">ОНЛАЙН-КУРС</span><h3>Как выйти из<br /><em>личностного кризиса</em></h3><p className="muted">Разобраться в том, что беспокоит.<br />Понять, чего хочется вам.<br />Начать пробовать новое.</p><div className="participation-space" aria-hidden="true" /><TestEmail /></div></section>
    </main>
    <footer className="wrap footer"><div className="footer-top"><Brand /><div className="footer-social" aria-hidden="true" /><a className="back-top" href="#course">Наверх <ArrowUpRight size={18} /></a></div><div className="legal"><p>© 2026 Курсы и практики.<br />Для самостоятельной работы над собой.</p><div className="legal-space" aria-hidden="true" /><p>Материалы курса не являются медицинскими рекомендациями. Программа не заменяет психотерапию или лечение.</p></div></footer>
  </>;
}
