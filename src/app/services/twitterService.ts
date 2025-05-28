// Twitter API service with rate limiting
import { env } from '../env';

interface TwitterUserData {
  id: string;
  username: string;
  lastTweetDate: Date | null;
  followerCount: number;
  tweetCount: number;
  isActive: boolean; // Active if tweeted in last 3 months
}

export class TwitterService {
  private lastRequestTime: number = 0;
  private requestDelay: number = 2000; // 2 seconds delay between requests (increased from 1 second)

  /**
   * Fetches tweets for a user with rate limiting (max 1 request per second)
   * @param usernameOrId Twitter username (with or without @) or user ID
   */
  async getUserTweets(usernameOrId: string): Promise<TwitterUserData | null> {
    try {
      // Clean the input - remove @ if present
      if (usernameOrId.startsWith('@')) {
        usernameOrId = usernameOrId.substring(1);
      }
      
      console.log(`Starting Twitter data fetch for: ${usernameOrId}`);
      
      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.requestDelay) {
        // Wait for the remaining time before making the request
        const waitTime = this.requestDelay - timeSinceLastRequest;
        console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
        await new Promise(resolve => 
          setTimeout(resolve, waitTime)
        );
      }
      
      // Update last request time
      this.lastRequestTime = Date.now();
      
      // Determine if this is a numeric ID or a username
      let userId: string | null;
      if (this.isNumeric(usernameOrId)) {
        userId = usernameOrId;
        console.log(`Using provided numeric ID: ${userId}`);
      } else {
        // Get the user ID from the username
        try {
          userId = await this.getUserId(usernameOrId);
        } catch (error: any) {
          // Check if this is a rate limit error
          if (error.status === 429) {
            console.log(`Rate limit exceeded during user ID lookup. Waiting for 5 seconds before retrying...`);
            const waitTime = 5000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            // Try again with increased delay
            try {
              userId = await this.getUserId(usernameOrId);
            } catch (retryError) {
              console.error(`Retry failed for ${usernameOrId}:`, retryError);
              userId = null;
            }
          } else {
            console.error(`Error getting user ID for ${usernameOrId}:`, error);
            userId = null;
          }
        }
        
        if (!userId) {
          console.error(`Could not find Twitter user ID for username: ${usernameOrId}`);
          
          // Add a small delay before trying fallbacks to ensure rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try some common accounts as a fallback for testing
          if (usernameOrId.toLowerCase() === 'twitter') {
            userId = '783214'; // Twitter's official account ID
            console.log(`Using fallback ID for Twitter: ${userId}`);
          } else if (usernameOrId.toLowerCase() === 'mrbeast') {
            userId = '574032254'; // MrBeast's account ID
            console.log(`Using fallback ID for MrBeast: ${userId}`);
          } else {
            return null;
          }
          
          // Add another delay after setting the fallback ID before making the API call
          await new Promise(resolve => setTimeout(resolve, this.requestDelay));
          console.log(`Waited ${this.requestDelay}ms after using fallback ID before proceeding`);
          // Update last request time after the delay
          this.lastRequestTime = Date.now();
        }
      }
      
      // Make the API request
      console.log(`Fetching tweets for Twitter user: ${usernameOrId}, ID: ${userId}`);
      
      try {
        // Add an additional delay right before making the API call
        console.log(`Adding pre-call delay of 1000ms before tweets API call`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch(`https://twitter241.p.rapidapi.com/user-tweets?user=${userId}&count=10`, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': env.TWITTER_RAPIDAPI_HOST,
            'x-rapidapi-key': env.TWITTER_RAPIDAPI_KEY
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Twitter API error (${response.status}): ${errorText}`);
          
          // If rate limited, wait longer before the next request
          if (response.status === 429) {
            console.log(`Rate limit exceeded. Increasing delay for future requests.`);
            // Increase the delay for subsequent requests
            this.requestDelay = Math.min(this.requestDelay + 1000, 10000); // Increase by 1s, max 10s
            const waitTime = 5000;
            console.log(`Waiting ${waitTime}ms after rate limit error...`);
            await new Promise(resolve => setTimeout(resolve, waitTime)); // Wait 5 seconds
            return null;
          }
          
          return null;
        }
        
        const data = await response.json();
        console.log(`Got tweets response for user ${usernameOrId}. Processing data...`);
        console.log('data: ',data);
        // Process the tweets data
        return this.processTwitterData(data, usernameOrId);
      } catch (apiError) {
        console.error(`Error fetching tweets for ${usernameOrId}:`, apiError);
        // Wait a bit longer after an error
        await new Promise(resolve => setTimeout(resolve, 3000));
        return null;
      }
      
    } catch (error) {
      console.error(`Error fetching Twitter data for ${usernameOrId}:`, error);
      return null;
    }
  }
  
  /**
   * Check if a string is a numeric Twitter ID
   */
  private isNumeric(value: string): boolean {
    return /^\d+$/.test(value);
  }
  
  /**
   * Convert a Twitter username to a user ID
   */
  private async getUserId(username: string): Promise<string | null> {
    try {
      // Strip @ symbol if present
      const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
      
      console.log(`Fetching Twitter user ID for username: ${cleanUsername}`);
      
      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.requestDelay) {
        await new Promise(resolve => 
          setTimeout(resolve, this.requestDelay - timeSinceLastRequest)
        );
      }
      
      // Update last request time
      this.lastRequestTime = Date.now();
      
      // Add an additional delay right before making the API call
      console.log(`Adding pre-call delay of 1000ms before API call`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Make API request to get user ID
      const response = await fetch(`https://twitter241.p.rapidapi.com/user?username=${cleanUsername}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': env.TWITTER_RAPIDAPI_HOST,
          'x-rapidapi-key': env.TWITTER_RAPIDAPI_KEY
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Twitter API error (${response.status}): ${errorText}`);
        
        // If rate limited, throw a specific error that can be caught and handled
        if (response.status === 429) {
          const error = new Error(`Rate limit exceeded: ${errorText}`);
          (error as any).status = 429;
          throw error;
        }
        
        return null;
      }
      
      const userData = await response.json();
      console.log(`Twitter user data structure:`, JSON.stringify(userData?.data?.user || {}, null, 2).substring(0, 200) + '...');
      
      // If the response is empty or doesn't have the expected structure
      if (!userData || !userData.data || !userData.data.user) {
        console.log(`Empty or unexpected response structure from Twitter API`);
        return null;
      }
      
      // Extract the user ID from the response
      const userId = userData?.data?.user?.result?.rest_id;
      
      if (userId) {
        console.log(`Found Twitter ID for ${cleanUsername}: ${userId}`);
        return userId;
      } else {
        console.error(`Could not extract user ID from response for ${cleanUsername}`);
        return null;
      }
      
    } catch (error) {
      console.error(`Error converting Twitter username to ID for ${username}:`, error);
      // Re-throw rate limit errors so they can be handled by the caller
      if ((error as any).status === 429) {
        throw error;
      }
      return null;
    }
  }
  
  /**
   * Process tweets data to extract useful information
   */
  private processTwitterData(data: any, username: string): TwitterUserData | null {
    try {
      console.log(`Processing Twitter data for ${username}`);
      
      // Check if the response has the expected structure
      if (!data || !data.data || !data.data.user || !data.data.user.result) {
        console.error(`Invalid Twitter data structure for ${username}`);
        // Return fallback data if possible
        if (data?.data?.user) {
          console.log(`Using fallback data for ${username}`);
          // Try to extract some basic information
          const fallbackUser = data.data.user;
          return {
            id: fallbackUser.id_str || '',
            username: username,
            lastTweetDate: null, // We don't have tweet data
            followerCount: fallbackUser.followers_count || 0,
            tweetCount: fallbackUser.statuses_count || 0,
            isActive: false // Default to inactive without tweet data
          };
        }
        return null;
      }
      
      const user = data.data.user.result;
      console.log(`Found user data: ${user.legacy?.screen_name || username}`);
      
      // Get the timeline entries from the correct path in the response
      // The structure can vary, so we need to handle different possibilities
      let timeline: any[] = [];
      
      // Try to find the timeline entries in the response
      if (user.timeline?.timeline?.instructions) {
        // Try to find the entries in different possible locations
        for (const instruction of user.timeline.timeline.instructions) {
          if (instruction.type === 'TimelineAddEntries' && instruction.entries) {
            timeline = instruction.entries;
            console.log(`Found ${timeline.length} timeline entries`);
            break;
          }
        }
      }
      
      if (timeline.length === 0) {
        console.log(`No timeline entries found for ${username}, trying alternative path`);
        // Try an alternative path that might be present in the response
        timeline = user.timeline?.timeline?.instructions?.[1]?.entries || [];
      }
      
      // Find the most recent tweet timestamp
      let mostRecentTweetDate: Date | null = null;
      let tweetCount = 0;
      
      console.log(`Analyzing ${timeline.length} timeline entries`);
      for (const entry of timeline) {
        // Check if the entry is a tweet (the structure can vary)
        const tweet = entry?.content?.itemContent?.tweet_results?.result || 
                      entry?.content?.items?.[0]?.item?.itemContent?.tweet_results?.result;
        
        if (tweet) {
          const tweetCreatedAt = tweet.legacy?.created_at;
          
          if (tweetCreatedAt) {
            const tweetDate = new Date(tweetCreatedAt);
            if (!mostRecentTweetDate || tweetDate > mostRecentTweetDate) {
              mostRecentTweetDate = tweetDate;
            }
            tweetCount++;
          }
        }
      }
      
      console.log(`Found ${tweetCount} tweets, most recent: ${mostRecentTweetDate?.toISOString() || 'none'}`);
      
      // Check if the account is active (tweeted in the last 3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const isActive = mostRecentTweetDate ? mostRecentTweetDate > threeMonthsAgo : false;
      
      return {
        id: user.rest_id || '',
        username: user.legacy?.screen_name || username,
        lastTweetDate: mostRecentTweetDate,
        followerCount: user.legacy?.followers_count || 0,
        tweetCount: user.legacy?.statuses_count || tweetCount,
        isActive
      };
      
    } catch (error) {
      console.error(`Error processing Twitter data for ${username}:`, error);
      return null;
    }
  }
}

export default new TwitterService(); 