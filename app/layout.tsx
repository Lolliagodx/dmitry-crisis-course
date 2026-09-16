import type { Metadata } from 'next';
import './globals.css';
import CourseTools from './course-tools';
export const metadata: Metadata = { title: 'Новая точка отсчета', description: 'Образовательная программа самопомощи: точка А и цели, здоровье и энергия, эмоции, отношения, реализация, финансы и ежедневная практика.', icons: { icon: `${process.env.GITHUB_PAGES === 'true' ? '/dmitry-crisis-course' : ''}/favicon.svg` }, robots: { index: false, follow: false } };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="ru"><body>{children}<CourseTools/></body></html> }
