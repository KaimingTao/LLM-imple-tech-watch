import Link from 'next/link';

const features = [
  {
    title: 'Global CDN Delivery',
    description:
      'Stream video through edge POPs close to your viewers with zero-buffer playback.'
  },
  {
    title: 'Secure Playback',
    description:
      'Signed URLs and DRM-ready architecture keeps premium content protected.'
  },
  {
    title: 'Multi-Region Uploads',
    description:
      'Ingest from the nearest region and replicate assets automatically.'
  }
];

export default function LandingPage() {
  return (
    <main>
      <div className="container flex flex-col gap-24 py-24">
        <header className="space-y-4 text-center">
          <span className="rounded-full border border-teal-400/40 px-4 py-1 text-xs uppercase tracking-[0.2em] text-teal-400">
            StreamForge Platform
          </span>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            Launch a premium video experience in days, not months.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            Deploy a full-stack streaming platform with authentication, adaptive
            playback, CDN-backed delivery, and observability baked in.
          </p>
          <div className="flex justify-center gap-4 pt-6">
            <Link
              href="/dashboard/videos"
              className="rounded-md bg-teal-500 px-5 py-3 font-semibold text-slate-900 shadow-lg shadow-teal-500/30 transition hover:bg-teal-300"
            >
              View Demo Library
            </Link>
            <Link
              href="/(auth)/login"
              className="rounded-md border border-slate-700 px-5 py-3 font-semibold text-slate-100 transition hover:border-slate-500 hover:text-white"
            >
              Admin Login
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur"
            >
              <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
              <p className="pt-2 text-sm text-slate-400">{feature.description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
