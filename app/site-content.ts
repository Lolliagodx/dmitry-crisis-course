// Neutral working copy until the final positioning is approved.
export const authorContent = {
  role: 'Автор курса трансформации личности',
  description: 'Личностный кризис, тревога, усталость. Работа с тем, что сейчас беспокоит, восстановление ресурса и поиск дальнейшего пути.',
  paragraphs: [
    'В моей жизни были сложные периоды, когда приходилось заново искать, на что опереться и куда двигаться дальше. Этот прожитый опыт — часть моей работы с людьми.',
    'Сейчас в центре моей работы — личностные кризисы, тревога и восстановление ресурса. Начинаем с конкретного запроса: что происходит в вашей жизни и что хочется изменить.',
  ],
  additionalExperience: 'Опыт телесных практик остаётся одним из дополнительных инструментов, а не основным направлением работы.',
};

// The call and price are confirmed; the booking method is still pending.
// Setting bookingUrl does not connect payment processing.
export const consultation: {
  durationMinutes: number;
  discussedPriceRange: string;
  priceRub: number | null;
  bookingUrl: string | null;
} = {
  durationMinutes: 30,
  discussedPriceRange: '2 000–2 500 ₽',
  priceRub: 5000,
  bookingUrl: null,
};
