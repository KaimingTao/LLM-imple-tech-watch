'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PlayerShell } from '@components/player-shell';

const Hls = dynamic(() => import('@components/video-player'), { ssr: false });

function VideoPlayerInner() {
  const params = useSearchParams();
  const src = params.get('src');

  if (!src) {
    return <p className="text-slate-300">Playback URL missing.</p>;
  }

  return <Hls src={src} />;
}

export default function PlayerPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950">
      <PlayerShell>
        <Suspense fallback={<p className="text-slate-300">Loading player…</p>}>
          <VideoPlayerInner />
        </Suspense>
      </PlayerShell>
    </main>
  );
}
