import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Explicit route configuration for Next.js 14
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: {
        blockchain: 'stellar',
      },
      include: {
        socialMetrics: true,
        votes: true,
        categories: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to fetch Stellar projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Stellar projects' },
      { status: 500 }
    );
  }
} 