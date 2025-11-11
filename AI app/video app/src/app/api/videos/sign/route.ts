import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { createSignedUrl } from '@lib/cdn';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const path = body.path as string | undefined;

  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  const baseUrl = process.env.CDN_BASE_URL;
  const key = process.env.CDN_SIGNING_KEY;
  const keyId = process.env.CDN_SIGNING_KEY_ID;

  if (!baseUrl || !key || !keyId) {
    return NextResponse.json({ error: 'CDN signing is not configured' }, { status: 500 });
  }

  const signed = createSignedUrl({
    baseUrl,
    key,
    keyId,
    path
  });

  return NextResponse.json({ url: signed });
}
