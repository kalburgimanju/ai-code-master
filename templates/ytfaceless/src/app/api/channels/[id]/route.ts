import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { getVideosByChannel } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const channel = await db.getChannel(id);

  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  }

  return NextResponse.json({ channel });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const channel = await db.updateChannel(id, body);

  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  }

  return NextResponse.json({ channel });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await db.deleteChannel(id);

  if (!deleted) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
