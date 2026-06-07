import { NextRequest, NextResponse } from 'next/server';
import { flagReview } from '@/lib/actions/reviews';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === 'string' ? body.reason : '';

    const result = await flagReview(params.id, reason);
    if (!result.success) {
      const status =
        result.error === 'You must be signed in to flag a review.' ? 401 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ flagged: result.flagged });
  } catch (error) {
    console.error('POST /api/reviews/[id]/flag error:', error);
    return NextResponse.json({ error: 'Failed to flag review' }, { status: 500 });
  }
}
