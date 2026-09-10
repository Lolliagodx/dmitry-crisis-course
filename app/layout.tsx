import type { Metadata } from 'next';
import './globals.css';
import CourseTools from './course-tools';
export const metadata: Metadata = { title: 'Дмитрий — личностный кризис · Макет курса', description: 'Макет образовательной и практической программы самопомощи Дмитрия. Содержание и условия участия в разработке.', robots: { index: false, follow: false } };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="ru"><body>{children}<CourseTools/></body></html> }

