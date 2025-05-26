import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Repository {
  name: string;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
  description: string;
}

export async function GET(
  request: Request,
  { params }: { params: { org: string } }
) {
  try {
    const org = params.org;
    
    // Decode the URL parameter in case it's URL encoded
    const decodedOrg = decodeURIComponent(org);
    
    console.log('Fetching GitHub data for organization:', decodedOrg);
    
    // Handle potential issues with the org format
    let orgName;
    
    // Check if the org contains the full URL
    if (decodedOrg.includes('github.com')) {
      // Extract org from URL
      const urlMatch = decodedOrg.match(/github\.com\/([^/]+)/);
      if (urlMatch) {
        orgName = urlMatch[1];
      }
    } else {
      // Assume it's already the org name
      orgName = decodedOrg;
    }
    
    if (!orgName) {
      console.error('Invalid organization format:', decodedOrg);
      return NextResponse.json(
        { error: 'Invalid organization format. Expected organization name or GitHub URL' },
        { status: 400 }
      );
    }

    console.log(`Parsed organization as: "${orgName}"`);

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

    // Get repositories for the organization
    const apiUrl = `https://api.github.com/orgs/${orgName}/repos?sort=updated&per_page=100`;
    console.log('Calling GitHub API:', apiUrl);
    
    const response = await fetch(apiUrl, { headers });
    console.log('GitHub API response status:', response.status);

    if (response.status === 404) {
      console.error('GitHub organization not found:', decodedOrg);
      return NextResponse.json(
        { error: 'Organization not found' },
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

    const repositories: Repository[] = await response.json();
    console.log(`Retrieved ${repositories.length} repositories for organization:`, orgName);
    
    if (repositories.length === 0) {
      return NextResponse.json(
        { error: 'No repositories found for this organization' },
        { status: 404 }
      );
    }
    
    // Sort repositories by update date (most recent first)
    repositories.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    
    // Get the most recently updated repository
    const mostRecentRepo = repositories[0];
    
    // Calculate total stars and forks across all repositories
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    const result = {
      stars: totalStars,
      forks: totalForks,
      lastUpdate: mostRecentRepo.updated_at,
      name: orgName,
      mostRecentRepo: mostRecentRepo.name,
      repoCount: repositories.length,
    };
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching GitHub organization data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub organization data', message: error?.message || String(error) },
      { status: 500 }
    );
  }
} 