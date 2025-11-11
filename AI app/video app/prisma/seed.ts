import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const password = 'demo1234';
  const passwordHash = hashSHA256(password);

  await prisma.user.upsert({
    where: { email: 'demo@streamforge.io' },
    update: {},
    create: {
      email: 'demo@streamforge.io',
      passwordHash,
      name: 'Demo Admin',
      role: 'ADMIN'
    }
  });

  await prisma.video.createMany({
    data: [
      {
        title: 'Exploring the Aurora Belt',
        description: '4K timelapse showcasing aurora phenomena across Scandinavia.',
        playbackUrl: 'https://global-stream-cdn.example.com/videos/aurora.m3u8',
        thumbnailUrl: 'https://global-stream-cdn.example.com/thumbnails/aurora.jpg',
        durationSeconds: 382,
        region: 'eu-central-1'
      },
      {
        title: 'Deep Sea Wonders',
        description: 'Documentary short featuring marine life captured in HDR10.',
        playbackUrl: 'https://global-stream-cdn.example.com/videos/deep-sea.m3u8',
        thumbnailUrl: 'https://global-stream-cdn.example.com/thumbnails/deep-sea.jpg',
        durationSeconds: 512,
        region: 'ap-southeast-1'
      }
    ],
    skipDuplicates: true
  });
}

function hashSHA256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
