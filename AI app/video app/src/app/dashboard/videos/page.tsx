import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { prisma } from '@lib/prisma/client';
import { sampleVideos } from '@lib/sample-data';
import { VideoCard } from '@components/video-card';

async function getSession() {
  return getServerSession(authOptions);
}

export default async function VideoDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/(auth)/login');
  }

  let videos;
  try {
    videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.warn('Falling back to sample data', error);
    videos = sampleVideos;
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-950">
      <section className="container py-16">
        <header className="flex flex-col gap-2 pb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-400">Library</p>
          <h1 className="text-3xl font-semibold text-white">Streaming Catalog</h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Videos replicate across edge regions automatically. Playback URLs
            point to your CDN distribution and respect signed URL policies. Use
            the Play action to load the viewer optimized for HLS.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </section>
    </main>
  );
}
