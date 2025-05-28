import { NextResponse } from 'next/server';
import TwitterService from '@/app/services/twitterService';

export const dynamic = 'force-dynamic';

// Track the last request time for additional rate limiting at the API level
let lastRequestTime = 0;
const minRequestDelay = 3000; // 3 seconds minimum between API endpoint calls

/**
 * Test endpoint for Twitter API
 * Usage: /api/twitter/test?username=MrBeast
 */
export async function GET(request: Request) {
  try {
    // Add rate limiting at the API endpoint level
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < minRequestDelay) {
      const waitTime = minRequestDelay - timeSinceLastRequest;
      console.log(`API Rate limiting: waiting ${waitTime}ms before processing request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Update last request time
    lastRequestTime = Date.now();
    
    // Get the username from the query string
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'MrBeast';
    
    console.log(`Twitter API Test: Fetching data for ${username}`);
    
    // Get tweets and user data
    const userData = await TwitterService.getUserTweets(username);
    
    if (!userData) {
      console.log(`Failed to fetch Twitter data for ${username}, waiting before responding...`);
      // Add a delay before responding with an error to prevent rapid retries
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return NextResponse.json(
        { error: `Failed to fetch Twitter data for ${username}` },
        { status: 404 }
      );
    }
    
    // Calculate freshness based on last tweet date
    let freshness = 'inactive';
    
    if (userData.lastTweetDate) {
      const now = new Date();
      const lastTweetDate = new Date(userData.lastTweetDate);
      
      // Calculate months since last tweet
      const monthsSinceLastTweet = 
        (now.getFullYear() - lastTweetDate.getFullYear()) * 12 + 
        (now.getMonth() - lastTweetDate.getMonth());
      
      if (monthsSinceLastTweet < 1) {
        freshness = 'active'; // Tweeted within the last month
      } else if (monthsSinceLastTweet < 3) {
        freshness = 'semi-active'; // Tweeted in the last 3 months
      }
      // Otherwise it's inactive (no tweets in 3+ months)
    }
    
    const response = {
      username: userData.username,
      lastUpdate: userData.lastTweetDate ? userData.lastTweetDate.toISOString() : null,
      followerCount: userData.followerCount,
      tweetCount: userData.tweetCount,
      isActive: userData.isActive,
      freshness,
      message: 'Twitter API test successful!'
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Twitter API Test error:', error);
    
    // Add a delay before responding with an error
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return NextResponse.json(
      { error: 'Failed to fetch Twitter data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 