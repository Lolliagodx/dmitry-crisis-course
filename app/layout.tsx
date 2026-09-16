import type { Metadata } from 'next';
import './globals.css';
import CourseTools from './course-tools';
export const metadata: Metadata = { title: 'Дмитрий — Новая точка отсчёта', description: 'Образовательная программа самопомощи Дмитрия: точка А и цели, здоровье и энергия, эмоции, отношения, реализация, финансы и ежедневная практика.', robots: { index: false, follow: false } };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="ru"><body>{children}<CourseTools/></body></html> }
