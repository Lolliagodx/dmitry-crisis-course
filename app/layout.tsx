import type { Metadata } from 'next';
import './globals.css';
import CourseTools from './course-tools';
export const metadata: Metadata = { title: 'Дмитрий Давыдов — курсы и практики', description: 'Когда привычная жизнь больше не радует: курс о личностном кризисе, собственных желаниях и первых шагах к переменам.', icons: { icon: `${process.env.GITHUB_PAGES === 'true' ? '/dmitry-crisis-course' : ''}/favicon.svg?v=green-2` }, robots: { index: false, follow: false } };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="ru"><body>{children}<CourseTools/></body></html> }
