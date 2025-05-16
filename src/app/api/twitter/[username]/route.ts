import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username;
    
    // First get the user ID with public metrics
    const userResponse = await fetch(
      `https://api.x.com/2/users/by/username/${username}?user.fields=public_metrics,created_at`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );

    if (!userResponse.ok) {
      console.error('Twitter API error:', await userResponse.text());
      throw new Error('Failed to fetch Twitter user data');
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
      console.error('Twitter API error:', await tweetsResponse.text());
      throw new Error('Failed to fetch Twitter tweets data');
    }

    const tweetsData = await tweetsResponse.json();
    const lastTweet = tweetsData.data?.[0];
    
    return NextResponse.json({
      followers: userData.data.public_metrics?.followers_count || 0,
      lastUpdate: lastTweet?.created_at || userData.data.created_at,
    });
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Twitter data' },
      { status: 500 }
    );
  }
} 