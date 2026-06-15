import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json({ error: 'Missing followingId' }, { status: 400 });
    }

    if (user.id === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: followingId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.followRelation.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId } },
    });

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following' }, { status: 400 });
    }

    // Create follow relation
    const follow = await prisma.followRelation.create({
      data: {
        followerId: user.id,
        followingId,
      },
    });

    // Create activity entry
    await prisma.userInteraction.create({
      data: {
        userId: user.id,
        contentId: followingId,
        contentType: 'user',
        actionType: 'follow',
        metadata: { targetUsername: targetUser.username },
      },
    });

    return NextResponse.json({ follow, success: true });
  } catch (error) {
    console.error('POST /api/follow error:', error);
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const followingId = searchParams.get('followingId');

    if (!followingId) {
      return NextResponse.json({ error: 'Missing followingId' }, { status: 400 });
    }

    const existingFollow = await prisma.followRelation.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId } },
    });

    if (!existingFollow) {
      return NextResponse.json({ error: 'Not following this user' }, { status: 400 });
    }

    await prisma.followRelation.delete({
      where: { followerId_followingId: { followerId: user.id, followingId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/follow error:', error);
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || user.id;
    const type = searchParams.get('type') || 'followers'; // 'followers' or 'following'

    if (type === 'followers') {
      const followers = await prisma.followRelation.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
              bio: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Check if current user follows each follower
      const followerIds = followers.map((f) => f.followerId);
      const currentUserFollows = await prisma.followRelation.findMany({
        where: {
          followerId: user.id,
          followingId: { in: followerIds },
        },
        select: { followingId: true },
      });
      const followsSet = new Set(currentUserFollows.map((f) => f.followingId));

      const followersWithStatus = followers.map((f) => ({
        ...f.follower,
        isFollowing: followsSet.has(f.followerId),
      }));

      return NextResponse.json({ users: followersWithStatus });
    } else {
      const following = await prisma.followRelation.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
              bio: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // All are already followed by definition
      const followingWithStatus = following.map((f) => ({
        ...f.following,
        isFollowing: true,
      }));

      return NextResponse.json({ users: followingWithStatus });
    }
  } catch (error) {
    console.error('GET /api/follow error:', error);
    return NextResponse.json({ error: 'Failed to fetch follow data' }, { status: 500 });
  }
}
