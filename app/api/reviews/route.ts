import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createReview } from '@/lib/actions/reviews';

const VALID_SORTS = ['most-liked', 'most-recent', 'highest-rated', 'lowest-rated', 'most-helpful'] as const;
type SortKey = typeof VALID_SORTS[number];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');
    const sort = (searchParams.get('sort') || 'most-liked') as SortKey;
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: 'contentId and contentType are required' },
        { status: 400 }
      );
    }

    const user = await getUser();

    // Build the orderBy clause for the requested sort
    let orderBy: any;
    switch (sort) {
      case 'most-recent':
        orderBy = { createdAt: 'desc' };
        break;
      case 'highest-rated':
        orderBy = [{ rating: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'lowest-rated':
        orderBy = [{ rating: 'asc' }, { createdAt: 'desc' }];
        break;
      case 'most-helpful':
        orderBy = [{ likes: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'most-liked':
      default:
        orderBy = [{ likes: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    const [reviews, total, aggregate, currentUserLike] = await Promise.all([
      prisma.review.findMany({
        where: {
          contentId,
          contentType,
          isFlagged: false,
        },
        orderBy,
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
              entertainmentDNA: {
                select: {
                  sciFi: true,
                  action: true,
                  comedy: true,
                  romance: true,
                  anime: true,
                  music: true,
                },
              },
            },
          },
        },
      }),
      prisma.review.count({
        where: { contentId, contentType, isFlagged: false },
      }),
      prisma.review.aggregate({
        where: { contentId, contentType, isFlagged: false },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      user
        ? prisma.reviewLike.findMany({
            where: { userId: user.id, review: { contentId, contentType } },
            select: { reviewId: true, value: true },
          })
        : Promise.resolve([]),
    ]);

    const likeMap = new Map<string, 1 | -1>(
      (currentUserLike as any[]).map((l: any) => [l.reviewId, l.value as 1 | -1])
    );

    // Compute the user's review too (always at the top if exists)
    const ownReview = user
      ? await prisma.review.findUnique({
          where: {
            userId_contentId_contentType: {
              userId: user.id,
              contentId,
              contentType,
            },
          },
          include: {
            user: {
              select: { id: true, username: true, name: true, avatarUrl: true },
            },
          },
        })
      : null;

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        ...r,
        userVote: likeMap.get(r.id) || null,
      })),
      ownReview,
      total,
      stats: {
        average: aggregate._avg.rating || 0,
        count: aggregate._count._all,
      },
    });
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, contentType, contentTitle, rating, text, tags } = body;

    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: 'contentId and contentType are required' },
        { status: 400 }
      );
    }

    const result = await createReview({
      contentId,
      contentType,
      contentTitle,
      rating: Number(rating) || 0,
      text: text || '',
      tags: Array.isArray(tags) ? tags : [],
    });

    if (!result.success) {
      const status = result.error === 'You must be signed in to write a review.' ? 401 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ review: result.review, analysis: result.analysis });
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
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
      return NextResponse.json({ error: 'Review id is required' }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    if (review.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
