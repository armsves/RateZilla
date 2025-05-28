// Environment variables accessor

export const env = {
  // Twitter API
  TWITTER_RAPIDAPI_KEY: process.env.TWITTER_RAPIDAPI_KEY || 'a94785facfmsh8a58956c7a107a5p12f55djsn2cd3f46f9a6f',
  TWITTER_RAPIDAPI_HOST: process.env.TWITTER_RAPIDAPI_HOST || 'twitter241.p.rapidapi.com',
  
  // Other environment variables
  NODE_ENV: process.env.NODE_ENV || 'development',
}; 