import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { prisma } from '@lib/prisma/client';
import { sampleVideos } from '@lib/sample-data';

async function getSession() {
  return getServerSession(authOptions);
}

async function getVideo(id: string) {
  try {
    return await prisma.video.findUnique({ where: { id } });
  } catch (error) {
    console.warn('Falling back to sample video lookup', error);
    return sampleVideos.find((video) => video.id === id) ?? null;
  }
}

export default async function VideoDetails({ params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    redirect('/(auth)/login');
  }

  const video = await getVideo(params.id);

  if (!video) {
    notFound();
  }

  const createdAt = video.createdAt instanceof Date ? video.createdAt : new Date((video as any).createdAt ?? Date.now());
  const updatedAt = video.updatedAt instanceof Date ? video.updatedAt : new Date((video as any).updatedAt ?? Date.now());

  return (
    <main className="flex min-h-screen flex-col bg-slate-950">
      <section className="container space-y-10 py-16">
        <Link
          href="/dashboard/videos"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to catalog
        </Link>
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-400">Video</p>
          <h1 className="text-4xl font-semibold text-white">{video.title}</h1>
          <p className="max-w-2xl text-base text-slate-300">{video.description}</p>
        </header>
        <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
          <section className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt="Video thumbnail"
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <h2 className="text-lg font-semibold text-white">Playback</h2>
              <p className="text-sm text-slate-400">
                Secure your HLS/DASH URL with signed tokens before exposing to a
                web client. Use the Play button to load the inline player with
                querystring-based token injection.
              </p>
              <code className="block overflow-x-auto rounded bg-slate-950/80 p-3 text-xs text-teal-300">
                {video.playbackUrl}
              </code>
              <Link
                href={`/player?src=${encodeURIComponent(video.playbackUrl)}`}
                className="inline-flex items-center gap-2 rounded-md bg-teal-500 px-4 py-2 text-slate-900 transition hover:bg-teal-300"
              >
                Play Video
              </Link>
            </div>
          </section>
          <aside className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-lg font-semibold text-white">Metadata</h2>
            <dl className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Region</dt>
                <dd className="rounded-full border border-slate-700 px-3 py-1 uppercase tracking-[0.3em] text-white">
                  {video.region}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Duration</dt>
                <dd>{Math.floor(video.durationSeconds / 60)} min</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Created</dt>
                <dd>{createdAt.toISOString().split('T')[0]}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Last Updated</dt>
                <dd>{updatedAt.toISOString().split('T')[0]}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
