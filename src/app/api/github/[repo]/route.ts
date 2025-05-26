import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { repo: string } }
) {
  try {
    const repo = params.repo;
    
    // Decode the URL parameter in case it's URL encoded
    const decodedRepo = decodeURIComponent(repo);
    
    console.log('Fetching GitHub data for repo:', decodedRepo);
    
    // Handle potential issues with the repo format
    let owner, repoName;
    
    // Check if the repo contains the full URL
    if (decodedRepo.includes('github.com')) {
      // Extract owner/repo from URL
      const urlMatch = decodedRepo.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (urlMatch) {
        owner = urlMatch[1];
        repoName = urlMatch[2];
        // Clean up repoName (remove .git, query params, etc.)
        repoName = repoName.replace(/\.git$/, '').split('#')[0].split('?')[0];
      }
    } else {
      // Assume it's already in owner/repo format
      [owner, repoName] = decodedRepo.split('/');
    }
    
    if (!owner || !repoName) {
      console.error('Invalid repository format:', decodedRepo);
      return NextResponse.json(
        { error: 'Invalid repository format. Expected owner/repo or GitHub URL' },
        { status: 400 }
      );
    }

    console.log(`Parsed repo as owner: "${owner}", repo: "${repoName}"`);

    // Set up headers - use token if available, otherwise make unauthenticated request
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'StellarProductHunt-App',
    };
    
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
      console.log('Using GitHub token (first 4 chars):', process.env.GITHUB_TOKEN.substring(0, 4) + '...');
    } else {
      console.warn('No GITHUB_TOKEN found in environment variables. Using unauthenticated request (rate limited).');
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}`;
    console.log('Calling GitHub API:', apiUrl);
    
    const response = await fetch(apiUrl, { headers });
    console.log('GitHub API response status:', response.status);

    if (response.status === 404) {
      console.error('GitHub repository not found:', decodedRepo);
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub API error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `GitHub API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('GitHub data retrieved successfully for:', decodedRepo);
    
    const result = {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      lastUpdate: data.updated_at || new Date().toISOString(),
      name: data.name,
      description: data.description,
    };
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching GitHub data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data', message: error?.message || String(error) },
      { status: 500 }
    );
  }
} 