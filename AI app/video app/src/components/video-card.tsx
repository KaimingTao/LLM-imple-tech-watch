import Image from 'next/image';
import Link from 'next/link';

export type VideoCardProps = {
  id: string;
  title: string;
  description: string;
  playbackUrl: string;
  thumbnailUrl?: string | null;
  durationSeconds: number;
  region: string;
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function VideoCard(props: VideoCardProps) {
  const { id, title, description, playbackUrl, thumbnailUrl, durationSeconds, region } = props;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm transition hover:border-teal-500/60 hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden rounded-lg bg-slate-800">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt="Video thumbnail"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No thumbnail available
          </div>
        )}
        <span className="absolute right-2 top-2 rounded bg-slate-950/80 px-2 py-1 text-xs font-semibold text-slate-100">
          {formatDuration(durationSeconds)}
        </span>
      </div>
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </header>
      <footer className="mt-auto flex items-center justify-between text-xs text-slate-500">
        <span className="rounded-full border border-slate-700 px-3 py-1 uppercase tracking-widest">
          {region}
        </span>
        <Link
          href={`/dashboard/videos/${id}`}
          className="text-teal-400 transition hover:text-teal-200"
        >
          Details
        </Link>
        <Link
          href={`/player?src=${encodeURIComponent(playbackUrl)}`}
          className="rounded-md bg-teal-500 px-3 py-1 text-slate-900 transition hover:bg-teal-300"
        >
          Play
        </Link>
      </footer>
    </article>
  );
}
