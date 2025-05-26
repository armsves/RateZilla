import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username;
    console.log('Fetching Twitter data for username:', username);
    
    // Check if we have Twitter API credentials
    if (!process.env.TWITTER_BEARER_TOKEN) {
      console.warn('No TWITTER_BEARER_TOKEN found in environment variables. Returning mock data.');
      
      // Return mock data for development
      return NextResponse.json({
        followers: Math.floor(Math.random() * 5000) + 100,
        lastUpdate: new Date().toISOString(),
        isMockData: true,
      });
    }
    
    // First get the user ID with public metrics
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics,created_at`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );

    if (userResponse.status === 404) {
      console.error('Twitter user not found:', username);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error(`Twitter API error (${userResponse.status}):`, errorText);
      return NextResponse.json(
        { error: `Twitter API error: ${userResponse.status}` },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    
    if (!userData.data) {
      console.error('No user data found:', userData);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userData.data.id;
    console.log('Twitter user ID retrieved:', userId);

    // Then get the user's tweets
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );

    if (!tweetsResponse.ok) {
      console.error(`Twitter tweets API error (${tweetsResponse.status}):`, await tweetsResponse.text());
      // Continue with user data only
      return NextResponse.json({
        followers: userData.data.public_metrics?.followers_count || 0,
        lastUpdate: userData.data.created_at,
        name: userData.data.name,
      });
    }

    const tweetsData = await tweetsResponse.json();
    const lastTweet = tweetsData.data?.[0];
    console.log('Twitter data retrieved successfully for:', username);
    
    return NextResponse.json({
      followers: userData.data.public_metrics?.followers_count || 0,
      lastUpdate: lastTweet?.created_at || userData.data.created_at,
      name: userData.data.name,
    });
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Twitter data' },
      { status: 500 }
    );
  }
} 