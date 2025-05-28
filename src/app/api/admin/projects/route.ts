import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Explicit route configuration for Next.js 14
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Add explicit route segment config
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        website: body.website || null,
        githubUrl: body.githubUrl || null,
        twitterUrl: body.twitterUrl || null,
        logoUrl: body.logoUrl || null,
        blockchain: body.blockchain || 'stellar',
        socialMetrics: {
          create: {
            githubStars: 0,
            githubForks: 0,
            twitterFollowers: 0,
            projectFreshness: 0
          }
        },
        ...(body.categoryIds?.length && {
          categories: {
            connect: body.categoryIds.map((id: number) => ({ id }))
          }
        })
      },
      include: {
        categories: true
      }
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    
    // Check for unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A project with that name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch all projects for admin
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        socialMetrics: true,
        votes: true,
        categories: true
      },
    });

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update a project
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }
    
    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        description: body.description,
        website: body.website || null,
        githubUrl: body.githubUrl || null,
        twitterUrl: body.twitterUrl || null,
        logoUrl: body.logoUrl || null,
        blockchain: body.blockchain || 'stellar',
        categories: {
          // First disconnect all existing categories
          set: [],
          // Then connect the selected categories
          ...(body.categoryIds?.length && {
            connect: body.categoryIds.map((id: number) => ({ id }))
          })
        }
      },
      include: {
        categories: true
      }
    });
    
    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error) {
    console.error('Error updating project:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      } else if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A project with that name already exists' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a project
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    // First delete related records (due to cascade delete, this might not be necessary,
    // but it's safer to be explicit)
    await prisma.socialMetrics.deleteMany({
      where: { projectId: Number(id) },
    });
    
    await prisma.vote.deleteMany({
      where: { projectId: Number(id) },
    });
    
    await prisma.comment.deleteMany({
      where: { projectId: Number(id) },
    });
    
    // Then delete the project
    const project = await prisma.project.delete({
      where: { id: Number(id) },
    });
    
    return NextResponse.json(
      { success: true, message: 'Project deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting project:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
} 