import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TYPE_MAP = {
  all: undefined,
  movies: 'movie',
  anime: 'anime',
  'tv-shows': 'tv',
  music: 'music',
  podcast: 'podcast',
  completed: 'completed',
} as const;

type WatchlistType = keyof typeof TYPE_MAP;

function getTypeFilter(type: string): string | undefined {
  return TYPE_MAP[type as WatchlistType];
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const collectionId = searchParams.get('collection');
    const completedOnly = type === 'completed';

    const where: any = { userId: user.id };

    if (completedOnly) {
      where.completedAt = { not: null };
    } else if (collectionId) {
      where.collectionId = collectionId;
    } else {
      where.collectionId = null;
    }

    const typeFilter = getTypeFilter(type);
    if (typeFilter && !completedOnly) {
      where.contentType = typeFilter;
    }

    const items = await prisma.watchlistItem.findMany({
      where,
      include: {
        collection: { select: { id: true, name: true, emoji: true } },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('GET /api/watchlist error:', error);
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contentId, contentType, title, posterUrl, collectionId } = body;

    if (!contentId || !contentType || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already in watchlist
    const existing = await prisma.watchlistItem.findUnique({
      where: { userId_contentId_contentType: { userId: user.id, contentId, contentType } },
    });

    if (existing) {
      // Update collection if provided
      if (collectionId !== undefined) {
        await prisma.watchlistItem.update({
          where: { id: existing.id },
          data: { collectionId: collectionId || null },
        });
      }
      return NextResponse.json({ item: existing, alreadyExists: true });
    }

    // Get max order for this user
    const maxOrder = await prisma.watchlistItem.aggregate({
      where: { userId: user.id },
      _max: { order: true },
    });

    const item = await prisma.watchlistItem.create({
      data: {
        userId: user.id,
        contentId,
        contentType,
        title,
        posterUrl,
        collectionId: collectionId || null,
        order: (maxOrder._max.order ?? 0) + 1,
      },
      include: { collection: { select: { id: true, name: true, emoji: true } } },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('POST /api/watchlist error:', error);
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
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
      return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }

    const item = await prisma.watchlistItem.findUnique({ where: { id } });
    if (!item || item.userId !== user.id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await prisma.watchlistItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/watchlist error:', error);
    return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, completed, collectionId, order } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }

    const item = await prisma.watchlistItem.findUnique({ where: { id } });
    if (!item || item.userId !== user.id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const data: any = {};
    if (typeof completed === 'boolean') {
      data.completed = completed;
      data.completedAt = completed ? new Date() : null;
    }
    if (collectionId !== undefined) {
      data.collectionId = collectionId || null;
    }
    if (typeof order === 'number') {
      data.order = order;
    }

    const updated = await prisma.watchlistItem.update({
      where: { id },
      data,
      include: { collection: { select: { id: true, name: true, emoji: true } } },
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error('PATCH /api/watchlist error:', error);
    return NextResponse.json({ error: 'Failed to update watchlist item' }, { status: 500 });
  }
}
