import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'INSIGHT — 책에서 시작하는 지적 일상', description: '하루 한 편, 익숙한 생각 너머로. 책과 공개 자료에서 출발하는 독립적인 지식 매거진.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="ko"><body>{children}</body></html>; }
