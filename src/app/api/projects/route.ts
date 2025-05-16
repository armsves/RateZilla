import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Explicit route configuration for Next.js 14
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Add explicit route segment config
export const runtime = 'nodejs';

export async function GET(request: Request) {
  console.log('API route /api/projects was hit');
  try {
    const { searchParams } = new URL(request.url);
    const blockchain = searchParams.get('blockchain') || 'stellar';

    const projects = await prisma.project.findMany({
      where: {
        blockchain: blockchain
      },
      include: {
        contracts: true,
        socialMetrics: true,
        metrics: true,
        votes: true,
      },
    });

    // Transform the data to match the frontend's expected structure
    const transformedProjects = projects.map(project => {
      // Calculate average rating (1-5 stars)
      let averageRating = 0;
      if (project.votes && project.votes.length > 0) {
        averageRating = project.votes.reduce((sum, v) => sum + v.value, 0) / project.votes.length;
      }
      return {
        id: project.id.toString(),
        name: project.name,
        description: project.description || '',
        website: project.website || '',
        githubUrl: project.githubUrl || '',
        twitterUrl: project.twitterUrl || '',
        logoUrl: project.logoUrl || '',
        blockchain: project.blockchain,
        averageRating,
        metrics: {
          githubStars: project.socialMetrics?.githubStars || 0,
          twitterFollowers: project.socialMetrics?.twitterFollowers || 0,
          githubForks: project.socialMetrics?.githubForks || 0,
          projectFreshness: project.socialMetrics?.projectFreshness || 0,
        }
      };
    });

    console.log('Transformed projects:', JSON.stringify(transformedProjects, null, 2));
    return new NextResponse(JSON.stringify(transformedProjects), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch projects' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// POST /api/projects?projectId=...&userId=...&value=...
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = Number(searchParams.get('projectId'));
    const userId = searchParams.get('userId');
    const value = Number(searchParams.get('value'));
    if (!projectId || !userId || !value || value < 1 || value > 5) {
      return new NextResponse(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
    }
    // Upsert the user's rating for this project
    const vote = await prisma.vote.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: { value },
      create: { projectId, userId, value },
    });
    return new NextResponse(JSON.stringify({ success: true, vote }), { status: 200 });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to submit rating' }), { status: 500 });
  }
} 