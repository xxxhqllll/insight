import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.BASE_PATH || '';
  return {
    id: basePath + '/',
    name: 'INSIGHT — 책에서 시작하는 지적 일상',
    short_name: 'INSIGHT',
    description: '책에서 출발하는 독립적인 지식 매거진',
    lang: 'ko',
    start_url: basePath + '/',
    scope: basePath + '/',
    display: 'standalone',
    background_color: '#F8F7F4',
    theme_color: '#171A18',
    icons: [
      { src: basePath + '/icons/brain-i-192-v1.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: basePath + '/icons/brain-i-512-v1.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
    ]
  };
}
