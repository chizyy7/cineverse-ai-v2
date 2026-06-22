import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { id, email, username } = await request.json();

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });

    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    await prisma.user.create({
      data: {
        id,
        email,
        username: username || email.split('@')[0],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
