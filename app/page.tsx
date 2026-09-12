import { ArrowDown, ArrowUpRight, Compass } from 'lucide-react';

const topics = [
  ['01', 'Понять свою точку отсчёта', 'Что перестало работать в привычной жизни: отношения, работа, самоощущение или повседневные привычки. Внимание к своей ситуации помогает увидеть, где именно хочется перемен.', 'Вопрос к себе: что в моей жизни я больше не хочу оставлять как есть?'],
  ['02', 'Самооценка и личные опоры', 'Представления о себе, собственные ценности и повторяющиеся сценарии. Как замечать свои достижения и отличать личные желания от ожиданий окружающих.', 'Практика: дневник успехов и признание того, что уже удалось сделать.'],
  ['03', 'Окружение и отношения', 'Роль семьи, партнёра и друзей в период изменений. Поддержка, личные границы и открытый разговор о том, что для вас важно.', 'Вопрос к себе: с кем я могу обсудить свои перемены и какую поддержку хочу получить?'],
  ['04', 'От размышлений к действиям', 'Поиск направления, постановка целей и регулярные шаги. Вместо ожидания постоянной мотивации — внимание к ежедневным действиям и собственному прогрессу.', 'Практика: утром определить цель и действие на день, вечером — подвести итог.'],
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
          <div className="hero-copy"><p className="kicker">ПЕРЕМЕНЫ НАЧИНАЮТСЯ С ВАС</p><h1>Личностный кризис.<br /><em>Новая точка<br />отсчёта.</em></h1><p className="hero-description">Когда привычная жизнь больше не устраивает, а новое направление ещё не найдено. Курс о том, как лучше понять себя, определить свои опоры и перейти к осознанным действиям.</p><a className="button" href="#purchase">Узнать об участии <ArrowUpRight size={20} /></a><p className="hero-note">Личный опыт. Саморефлексия. Ежедневная практика.</p></div>
          <div className="hero-art" aria-hidden="true"><div className="art-line" /><div className="orbital"><i /><i /><i /><i /><span>↗</span></div><span className="art-word">ВЫБРАТЬ<br />СВОЙ ПУТЬ</span><span className="art-caption">НОВАЯ ТОЧКА ОТСЧЁТА</span><span className="art-corner">01 — ∞</span></div>
        </div>
        <div className="facts"><div><small>ФОРМАТ</small><span>Онлайн-программа</span></div><div className="reserved-fact" aria-hidden="true" /><div className="reserved-fact" aria-hidden="true" /><a href="#about" aria-label="Перейти к блоку об авторе"><ArrowDown size={21} /></a></div>
      </section>
      <section className="section wrap author" id="about">
        <div className="portrait" aria-hidden="true" />
        <div className="author-copy"><span className="eyebrow">01 / ЗНАКОМСТВО</span><h2>Дмитрий.<br /><em>Опыт, ставший<br />отправной точкой.</em></h2><p>Дмитрий пришёл к теме личностных перемен через собственный кризис. Он развивал транспортный бизнес, но всё яснее понимал: внешне понятный путь не даёт ответа на вопросы «кто я?» и «для чего я это делаю?».</p><p>Поворотным моментом стали встреча с наставником Артуром и участие в клубе личностного развития. Регулярные практики, работа с целями и новое окружение помогли ему переосмыслить привычный образ жизни.</p><p>Позже Дмитрий перешёл от транспортного бизнеса к массажу и индивидуальной работе с людьми. В основе курса — его личный опыт, внимание к себе и убеждение, что изменения складываются из конкретных действий.</p><div className="author-bottom"><span>От поиска себя —<br /><em>к собственному направлению.</em></span><div className="social-space" aria-hidden="true" /></div></div>
      </section>
      <section className="approach" id="approach"><div className="wrap section">
        <div className="section-heading"><div><span className="eyebrow">02 / ПОДХОД</span><h2>Внимание к себе.<br /><em>Место для действия.</em></h2></div><p className="heading-note">Курс задаёт направление для самостоятельной работы. В центре подхода Дмитрия — личная ответственность, регулярность и готовность пробовать новое.</p></div>
        <div className="approach-grid">{[
          ['01', 'Самонаблюдение', 'Замечать свои реакции, желания и повторяющиеся ситуации. Задавать себе честные вопросы, чтобы лучше понимать, что хочется изменить.'],
          ['02', 'Регулярная практика', 'Утром выбирать цель и конкретное действие. Вечером — смотреть, что получилось и приблизил ли прошедший день к выбранному направлению.'],
          ['03', 'Личный маршрут', 'Соотносить решения со своими ценностями. Находить поддержку в окружении и постепенно выстраивать собственный план следующих шагов.'],
        ].map(([n, title, copy]) => <article key={n}><span className="step">{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <div className="boundary"><Compass size={24} /><p>Программа посвящена самопомощи и жизненным ориентирам. Она не предназначена для диагностики или лечения заболеваний и не заменяет профессиональную помощь.</p></div>
      </div></section>
      <section className="section wrap program" id="program"><div><span className="eyebrow">03 / СОДЕРЖАНИЕ</span><h2>От понимания себя<br /><em>к новой главе.</em></h2><p className="muted">Самооценка, окружение, цели и повседневные действия — основные темы курса. Отправная точка — ваша ситуация и желание двигаться дальше.</p><span className="program-sign" aria-hidden="true">МЫСЛЬ → ДЕЙСТВИЕ → ОПЫТ</span></div><div className="topic-list">{topics.map(([n, title, copy, practice]) => <details key={n}><summary><span>{n}</span><h3>{title}</h3><span className="plus" aria-hidden="true">+</span></summary><div className="topic-content"><p>{copy}</p><p className="practice">{practice}</p></div></details>)}</div></section>
      <section className="wrap purchase" id="purchase"><div><span className="eyebrow">04 / УЧАСТИЕ</span><h2>Ваш следующий шаг.<br /><em>В своём темпе.</em></h2><p>Для тех, кто чувствует: «Я так больше не хочу» — и готов уделять время себе, пересматривать привычные решения и действовать.</p><div className="purchase-meta" aria-hidden="true" /></div><div className="purchase-card"><span className="kicker">КУРС ДМИТРИЯ</span><h3>Новая точка<br /><em>отсчёта.</em></h3><p className="muted">Понять, что важно именно вам.<br />Выбрать направление.<br />Сделать следующий шаг.</p><div className="participation-space" aria-hidden="true" /><a className="button button-outline" href="#program">Изучить программу <ArrowUpRight size={20} /></a></div></section>
    </main>
    <footer className="wrap footer"><div className="footer-top"><Brand /><div className="footer-social" aria-hidden="true" /><a className="back-top" href="#course">Наверх <ArrowUpRight size={18} /></a></div><div className="legal"><p>© 2026 Дмитрий.<br />Образовательная программа самопомощи.</p><div className="legal-space" aria-hidden="true" /><p>Материалы курса не являются медицинскими рекомендациями. Программа не заменяет психотерапию или лечение.</p></div></footer>
  </>;
}

