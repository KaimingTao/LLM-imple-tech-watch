import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { prisma } from '@lib/prisma/client';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const videos = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ videos });
}
