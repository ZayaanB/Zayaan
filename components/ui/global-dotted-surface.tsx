'use client';

import dynamic from 'next/dynamic';

export const GlobalDottedSurface = dynamic(
  () => import('@/components/ui/dotted-surface').then((m) => m.DottedSurface),
  { ssr: false }
);
