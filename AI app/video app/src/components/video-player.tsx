import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';

type Props = {
  src: string;
};

export default function VideoPlayer({ src }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    if (element.canPlayType('application/vnd.apple.mpegurl')) {
      element.src = src;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        backBufferLength: 90
      });

      hls.loadSource(src);
      hls.attachMedia(element);

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError(data.type ?? 'Unknown HLS error');
        }
      });

      return () => {
        hls.destroy();
      };
    }

    setError('HLS is not supported in this browser.');
  }, [src]);

  return (
    <div className="space-y-4">
      <video
        ref={videoRef}
        controls
        className="aspect-video w-full rounded-lg border border-slate-800 bg-black"
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-400">Playback Source</p>
        <code className="block overflow-x-auto text-xs text-slate-200">{src}</code>
      </div>
    </div>
  );
}
