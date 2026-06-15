import { NextRequest, NextResponse } from 'next/server';
import { likeReview } from '@/lib/actions/reviews';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const raw = body.value;
    if (raw !== 1 && raw !== -1) {
      return NextResponse.json({ error: 'value must be 1 or -1' }, { status: 400 });
    }

    const result = await likeReview(params.id, raw);
    if (!result.success) {
      const status =
        result.error === 'You must be signed in to vote.' ? 401 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      likes: result.likes,
      notHelpful: result.notHelpful,
      userValue: result.userValue,
    });
  } catch (error) {
    console.error('POST /api/reviews/[id]/like error:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}
