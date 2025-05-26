import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Check if token is set
    const githubToken = process.env.GITHUB_TOKEN || '';
    const hasToken = !!githubToken;
    
    // Test API with a well-known repository
    const testRepo = 'octocat/hello-world';
    
    // Set up headers
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'StellarProductHunt-App',
    };
    
    if (hasToken) {
      headers['Authorization'] = `Bearer ${githubToken}`;
    }
    
    // Make the request
    const apiUrl = `https://api.github.com/repos/${testRepo}`;
    const response = await fetch(apiUrl, { headers });
    
    // Check response
    const status = response.status;
    const isSuccess = response.ok;
    
    // Get response data if successful
    let data = null;
    if (isSuccess) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return NextResponse.json({
      test: 'GitHub API Test',
      hasToken,
      tokenFirstChars: hasToken ? githubToken.substring(0, 4) + '...' : null,
      testRepo,
      status,
      isSuccess,
      data: isSuccess ? {
        name: data.name,
        stars: data.stargazers_count,
        description: data.description
      } : data
    });
  } catch (error: any) {
    return NextResponse.json({
      test: 'GitHub API Test',
      error: error?.message || String(error),
      stack: error?.stack
    }, { status: 500 });
  }
} 