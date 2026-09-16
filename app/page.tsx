import TestEmail from './test-email';
import { ArrowDown, ArrowUpRight, Compass } from 'lucide-react';

const topics = [
  ['01', 'Точка А и цели', 'Оценка пяти сфер: здоровье и энергия, отношения, реализация, финансы и яркость жизни. Поиск собственных желаний за ожиданиями окружающих. Образ себя через десять лет и конкретные цели по SMART — ваша точка Б.', 'Практика: колесо баланса с оценками от 1 до 10, письменный образ будущего и ежедневные вопросы: что я сделаю для цели утром и что получилось к вечеру.'],
  ['02', 'Здоровье, энергия и эмоции', 'Внимание к сну, дыханию, напряжению и тому, что забирает силы. Тревога, страх, гнев, зависть и личные желания. Регулярность и дисциплина в повседневных действиях.', 'Практика: составить список того, что отнимает энергию, внедрять одну привычку за раз и неделю записывать свои эмоции и ситуации, в которых они возникают.'],
  ['03', 'Отношение к себе и близким', 'Самооценка, роль спасателя и привычка быть удобным. Признание собственных заслуг, отношения с родителями, благодарность и невысказанные чувства. Личные границы и поддержка в отношениях с партнёром.', 'Практика: дневник успеха, письма родителям для самостоятельной работы и разговор с партнёром по схеме «факты → чувства → просьба».'],
  ['04', 'Реализация, финансы и интеграция', 'Поиск направления через интересы, навыки и вопросы к себе. В авторском сценарии — разбор с ИИ и натальная карта как повод для размышлений, а не предсказание судьбы. Текущий и желаемый доход, установки о деньгах и возможные инструменты роста. Завершение — личный набор практик и понимание, когда нужна помощь специалиста.', 'Практика: вопросы для самоисследования, финансовый план на три месяца с шагами и сроками, личный ежедневник и повторная оценка колеса баланса.'],
];

function Brand() {
  return <a className="brand" href="#course" aria-label="Дмитрий — к началу страницы"><span className="brand-mark">д.</span><span>ДМИТРИЙ<small>НОВАЯ ТОЧКА ОТСЧЁТА</small></span></a>;
}

export default function Home() {
  return <>
    <a className="skip" href="#course">Перейти к содержанию</a>
    <header className="header">
      <Brand />
      <nav aria-label="Основное меню"><a href="#about">Об авторе</a><a href="#approach">Подход</a><a href="#program">Программа</a></nav>
      <div className="header-end"><div className="social-space" aria-hidden="true" /><a className="small-cta" href="#purchase">О курсе <ArrowUpRight size={17} /></a></div>
    </header>
    <main>
      <section className="hero wrap" id="course">
        <div className="hero-top"><span className="eyebrow"><span className="dot" />ОБРАЗОВАТЕЛЬНАЯ ПРОГРАММА САМОПОМОЩИ</span><span className="edition" aria-hidden="true">ДМИТРИЙ / ОНЛАЙН-КУРС</span></div>
        <div className="hero-grid">
          <div className="hero-copy"><p className="kicker">ПЕРЕМЕНЫ НАЧИНАЮТСЯ С ВАС</p><h1>Личностный кризис.<br /><em>Новая точка<br />отсчёта.</em></h1><p className="hero-description">Курс по преодолению личностного кризиса: от честной оценки своей жизни к целям и ежедневной практике. Здоровье и энергия, эмоции, отношения, реализация и финансы — шаг за шагом от точки А к своей точке Б.</p><a className="button" href="#purchase">Узнать об участии <ArrowUpRight size={20} /></a><p className="hero-note">10 учебных блоков. Практики и домашние задания.</p></div>
          <div className="hero-art" aria-hidden="true"><div className="art-line" /><div className="orbital"><i /><i /><i /><i /><span>↗</span></div><span className="art-word">ВЫБРАТЬ<br />СВОЙ ПУТЬ</span><span className="art-caption">НОВАЯ ТОЧКА ОТСЧЁТА</span><span className="art-corner">01 — ∞</span></div>
        </div>
        <div className="facts"><div><small>ФОРМАТ</small><span>Онлайн-программа</span></div><div className="reserved-fact" aria-hidden="true" /><div className="reserved-fact" aria-hidden="true" /><a href="#about" aria-label="Перейти к блоку об авторе"><ArrowDown size={21} /></a></div>
      </section>
      <section className="section wrap author" id="about">
        <div className="portrait" aria-hidden="true" />
        <div className="author-copy" aria-hidden="true"><div className="author-bottom"><div className="social-space" /></div></div>
      </section>
      <section className="approach" id="approach"><div className="wrap section">
        <div className="section-heading"><div><span className="eyebrow">02 / ПОДХОД</span><h2>Увидеть точку А.<br /><em>Выбрать точку Б.</em></h2></div><p className="heading-note">Каждый учебный блок завершается практикой и домашним заданием. Вы фиксируете свою ситуацию, определяете цели и возвращаетесь к ним через конкретные действия.</p></div>
        <div className="approach-grid">{[
          ['01', 'Честная оценка', 'Оценить пять сфер жизни по колесу баланса. Записать текущую картину и увидеть, чему вы хотите уделить внимание.'],
          ['02', 'Цель и действие', 'Описать желаемое будущее и разбить его на достижимые шаги. Утром выбирать действие для цели, вечером — подводить итог.'],
          ['03', 'Интеграция', 'Собрать подходящие практики в личный ежедневник. Возвращаться к колесу баланса, сравнивать оценки и замечать изменения.'],
        ].map(([n, title, copy]) => <article key={n}><span className="step">{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <div className="boundary"><Compass size={24} /><p>Программа посвящена самопомощи и жизненным ориентирам. Она не предназначена для диагностики или лечения заболеваний и не заменяет профессиональную помощь.</p></div>
      </div></section>
      <section className="section wrap program" id="program"><div><span className="eyebrow">03 / СОДЕРЖАНИЕ</span><h2>От понимания себя<br /><em>к новой главе.</em></h2><p className="muted">Десять учебных блоков: от точки А и целей через здоровье, эмоции и отношения к реализации, финансам и интеграции. Здесь они собраны в четыре темы.</p><span className="program-sign" aria-hidden="true">МЫСЛЬ → ДЕЙСТВИЕ → ОПЫТ</span></div><div className="topic-list">{topics.map(([n, title, copy, practice]) => <details key={n}><summary><span>{n}</span><h3>{title}</h3><span className="plus" aria-hidden="true">+</span></summary><div className="topic-content"><p>{copy}</p><p className="practice">{practice}</p></div></details>)}</div></section>
      <section className="wrap purchase" id="purchase"><div><span className="eyebrow">04 / УЧАСТИЕ</span><h2>Ваш следующий шаг.<br /><em>В своём темпе.</em></h2><p>Для тех, кто чувствует: «Я так больше не хочу» — и готов честно посмотреть на свою жизнь и выполнять задания. Курс даёт систему для самостоятельной работы: от оценки пяти сфер до личного ежедневника практик.</p><div className="purchase-meta" aria-hidden="true" /></div><div className="purchase-card"><span className="kicker">КУРС ДМИТРИЯ</span><h3>Новая точка<br /><em>отсчёта.</em></h3><p className="muted">Оценить свою точку А.<br />Определить цели.<br />Собрать личный план действий.</p><div className="participation-space" aria-hidden="true" /><TestEmail /></div></section>
    </main>
    <footer className="wrap footer"><div className="footer-top"><Brand /><div className="footer-social" aria-hidden="true" /><a className="back-top" href="#course">Наверх <ArrowUpRight size={18} /></a></div><div className="legal"><p>© 2026 Дмитрий.<br />Образовательная программа самопомощи.</p><div className="legal-space" aria-hidden="true" /><p>Материалы курса не являются медицинскими рекомендациями. Программа не заменяет психотерапию или лечение.</p></div></footer>
  </>;
}

