import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { checkAndAwardAchievements } from '@/lib/achievements/checker';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || user.id;

    // Get user's earned achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    // Map earned achievements
    const earnedMap = new Map(
      userAchievements.map((ua) => [
        ua.achievementId,
        { earnedAt: ua.earnedAt.toISOString() },
      ])
    );

    // Build response with all achievements and earned status
    const achievements = ACHIEVEMENTS.map((def) => ({
      ...def,
      condition: undefined, // Don't serialize functions
      progress: undefined,
      earned: earnedMap.has(def.id),
      earnedDate: earnedMap.get(def.id)?.earnedAt || null,
    }));

    return NextResponse.json({ achievements });
  } catch (error) {
    console.error('GET /api/achievements error:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check and award any new achievements
    const newlyEarned = await checkAndAwardAchievements(user.id);

    return NextResponse.json({ newlyEarned });
  } catch (error) {
    console.error('POST /api/achievements error:', error);
    return NextResponse.json({ error: 'Failed to check achievements' }, { status: 500 });
  }
}
