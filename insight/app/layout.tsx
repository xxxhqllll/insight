import type { Metadata, Viewport } from 'next';
import './globals.css';

const basePath = process.env.BASE_PATH || '';
const iconPath = basePath + '/icons/';

export const metadata: Metadata = {
  title: 'INSIGHT — 세계에서 시작하는 지적 일상',
  description: '하루 한 편, 익숙한 생각 너머로. 실제 해외 뉴스와 공개 자료에서 출발하는 독립적인 지식 매거진.',
  applicationName: 'INSIGHT',
  manifest: basePath + '/manifest.webmanifest',
  icons: {
    icon: [
      { url: iconPath + 'book-philosophy-32-v2.png', sizes: '32x32', type: 'image/png' },
      { url: iconPath + 'book-philosophy-192-v2.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: [{ url: iconPath + 'apple-touch-icon-book-v2.png', sizes: '180x180', type: 'image/png' }]
  },
  appleWebApp: { capable: true, title: 'INSIGHT', statusBarStyle: 'default' }
};

export const viewport: Viewport = { themeColor: '#171A18' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body>{children}</body></html>;
}
