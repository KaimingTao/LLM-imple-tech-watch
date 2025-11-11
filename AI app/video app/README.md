# StreamForge

StreamForge is a ready-to-run video streaming portal built with Next.js 14. It demonstrates how to combine authenticated admin workflows, multi-region asset replication, and CDN-backed playback in one project.

## Highlights

- 🔐 **Secure admin login** powered by NextAuth with Prisma sessions.
- 🎬 **Adaptive web player** using hls.js for HLS manifests and native fallbacks.
- 🌍 **Multi-region architecture** with Terraform modules for S3 replication and CloudFront delivery.
- 🚀 **CDN token signing** helpers exposed via `/api/videos/sign` for short-lived playback access.
- 🧩 **Composable UI** implemented with the Next.js App Router and Tailwind CSS.

## Getting Started

1. **Install dependencies** (Node 18+):
   ```bash
   npm install
   ```
2. **Copy environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Populate `DATABASE_URL`, `NEXTAUTH_SECRET`, and the CDN signing variables.
3. **Prepare the database**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts
   ```
   Replace the seed workflow with your provisioning pipeline in production.
4. **Run the dev server**:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000`. Use the seeded credentials `demo@streamforge.io` / `demo1234`.

## CDN + Multi-Region Delivery

- Use the Terraform templates in `infra/terraform` to create:
  - Versioned S3 origin bucket with CORS configured for your frontend domain.
  - CloudFront distribution tied to the bucket and optional custom domains.
  - Origin Access Identity to lock the bucket to CloudFront.
- Enable S3 cross-region replication between the primary bucket and replicas (add an IAM role + replication configuration referencing `replica_regions`).
- Store the CloudFront key pair ID and private key (converted to hex/HMAC) as `CDN_SIGNING_KEY_ID` and `CDN_SIGNING_KEY`. The `/api/videos/sign` endpoint signs manifest paths for authorized sessions.

## Authentication Workflow

- Credentials provider checks SHA-256 hashes stored in Postgres.
- `middleware.ts` protects `/dashboard/*` and `/api/videos*` routes.
- Extend Prisma models to include password resets, OAuth accounts, or RBAC as needed.

## Deployment Notes

- Build the Next.js app with `npm run build` and deploy to Vercel, AWS Amplify, or any platform that supports Next.js 14.
- Configure environment variables in your hosting provider.
- For edge regions, consider Vercel Edge / Next.js Middleware to direct viewers to the closest stream origin.

## Testing Ideas

- Add Playwright tests to cover login flows and player interactions.
- Mock signed URLs in integration tests using `createSignedUrl`.
- Use `@testing-library/react` for component-level assurance (forms, player states).

## Roadmap

- Integrate real user accounts via OAuth providers.
- Add upload workflows with background transcoding jobs (MediaConvert, ffmpeg).
- Instrument analytics (Mux Data, Segment) inside `video-player` hooks.
- Support DRM license acquisition with Shaka Player fallback.

Refer to `docs/architecture.md` for a deeper dive into the infrastructure choices.
