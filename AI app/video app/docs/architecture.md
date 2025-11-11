# StreamForge Architecture

StreamForge is a full-stack reference implementation for a secure, multi-region video streaming platform. The system is split across three layers:

1. **Application** – Next.js 14 (App Router) with NextAuth for session management. Administrators can log in, curate the video library, and trigger CDN-signed playback URLs.
2. **Media Pipeline** – Object storage (S3) for transcoded HLS/DASH renditions. Optional MediaConvert/MediaPackage jobs perform transmuxing and produce adaptive bit-rate manifests.
3. **Delivery** – CloudFront CDN in front of the origin bucket. Signed URLs ensure that only authorized viewers can request playback segments. Regional edge caches serve viewers close to their location.

## Deployment Flow

1. Upload mezzanine media to an ingest bucket in the closest region.
2. Trigger a transcode pipeline (e.g. AWS MediaConvert) to produce ABR renditions and push them into the multi-region replication bucket created by Terraform.
3. The app requests signed playback URLs for authorized viewers via `/api/videos/sign`. The API delegates to `createSignedUrl` with HMAC signatures.
4. The player loads the manifest through the CDN, automatically handling adaptive streaming via hls.js.

## Multi-Region Strategy

- **Primary region** handles writes, transcoding, and admin actions.
- **Replica regions** receive S3 cross-region replication so edge caches warm quickly for local viewers.
- **Failover** is achieved by promoting a replica bucket and updating the CloudFront origin if the primary region becomes unavailable.

## Observability Hooks

- CloudFront real-time metrics and standard logs feed into CloudWatch for playback analytics.
- Expose `/api/videos` for integration with monitoring dashboards (can be locked to admin IPs through middleware).
- Extend `Video` model with per-rendition health data as needed.

## Security Considerations

- All playback URLs must be signed; tokens expire quickly (default 5 minutes) and bind to a specific manifest path.
- NextAuth sessions are stored in Postgres via Prisma. Rotate `NEXTAUTH_SECRET` regularly.
- Attach AWS WAF to the CloudFront distribution to mitigate DDoS and bot scraping.
- Use DRM providers (Widevine, FairPlay) for premium content; this sample focuses on URL-signing but the pipeline accommodates license servers.

## Extensibility

- Replace PostgreSQL with a serverless alternative (e.g. Neon) for global availability.
- Swap CloudFront for Cloudflare Stream or Fastly by implementing provider-specific signing in `src/lib/cdn.ts`.
- Add SSE/WS for real-time watch party experiences.
- Integrate metrics collectors (Mux Data, Conviva) in `src/components/video-player.tsx`.
