export default function CoursePurchase() {
  const hosted = process.env.GITHUB_PAGES !== 'true';
  return <div className="course-purchase">
    <p className="course-price">2 900 ₽</p>
    {hosted ? <a className="button" href="/checkout.php?product=course">Получить курс</a> : <button className="button course-purchase-pending" type="button" disabled>Получить курс</button>}
    <p className="course-purchase-note">Тестовый режим. Реальные платежи не принимаются.</p>
  </div>;
}
