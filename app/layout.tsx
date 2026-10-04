import type { Metadata } from 'next';
import './globals.css';
import CourseTools from './course-tools';
export const metadata: Metadata = { title: 'Дмитрий Давыдов — курсы и практики', description: 'Личностный кризис, тревога и восстановление ресурса. Курс трансформации личности и вводная консультация с Дмитрием Давыдовым.', icons: { icon: `${process.env.GITHUB_PAGES === 'true' ? '/dmitry-crisis-course' : ''}/favicon.svg?v=green-2` }, robots: { index: false, follow: false } };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="ru"><body>{children}<CourseTools/></body></html> }
