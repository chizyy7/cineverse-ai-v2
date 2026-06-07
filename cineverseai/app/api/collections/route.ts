import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collections = await prisma.collection.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { watchlistItems: true } },
      },
    });

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('GET /api/collections error:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, emoji, description, isPublic } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        userId: user.id,
        name: name.trim(),
        emoji: emoji || '📁',
        description: description || null,
        isPublic: isPublic !== false,
      },
    });

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('POST /api/collections error:', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, emoji, description, isPublic } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing collection ID' }, { status: 400 });
    }

    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (emoji !== undefined) data.emoji = emoji;
    if (description !== undefined) data.description = description;
    if (isPublic !== undefined) data.isPublic = isPublic;

    const collection = await prisma.collection.update({
      where: { id },
      data,
    });

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('PATCH /api/collections error:', error);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing collection ID' }, { status: 400 });
    }

    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Unassign items in this collection (set collectionId to null) before deleting
    await prisma.watchlistItem.updateMany({
      where: { collectionId: id },
      data: { collectionId: null },
    });

    await prisma.collection.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/collections error:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
