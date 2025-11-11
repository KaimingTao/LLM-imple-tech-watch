import Link from 'next/link';
import type { PropsWithChildren } from 'react';

export function PlayerShell({ children }: PropsWithChildren) {
  return (
    <div className="container flex flex-col gap-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-teal-400">Player</p>
          <h1 className="text-2xl font-semibold text-white">StreamForge Player</h1>
        </div>
        <Link
          href="/dashboard/videos"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-teal-400 hover:text-white"
        >
          Back to Dashboard
        </Link>
      </header>
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        {children}
      </section>
    </div>
  );
}
