import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { repo: string } }
) {
  try {
    const repo = params.repo;
    const [owner, repoName] = repo.split('/');
    
    if (!owner || !repoName) {
      return NextResponse.json(
        { error: 'Invalid repository format. Expected owner/repo' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    if (!response.ok) {
      console.error('GitHub API error:', await response.text());
      throw new Error('Failed to fetch GitHub data');
    }

    const data = await response.json();
    
    return NextResponse.json({
      stars: data.stargazers_count,
      forks: data.forks_count,
      lastUpdate: data.updated_at,
    });
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    );
  }
} 