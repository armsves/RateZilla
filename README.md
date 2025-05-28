# StellarProductHunt - Web3 Project Discovery Platform

StellarProductHunt is a decentralized platform for discovering, rating, and reviewing Web3 projects on the Stellar blockchain. Built with Next.js and TypeScript, it provides a seamless experience for users to explore and evaluate projects on the Stellar network.

## Features

- 🔍 Project discovery on Stellar
- ⭐ Project rating and review system
- 💼 Stellar wallet integration
- 📊 Social metrics integration (GitHub, Twitter)
- 🎯 Project activity tracking
- 🔐 Secure wallet connections

## Supported Blockchain

- **Stellar**: Fast, secure, and low-cost blockchain for payments and tokenization

## Smart Contract

### Stellar Contract
```
CCR6QKTWZQYW6YUJ7UP7XXZRLWQPFRV6SWBLQS4ZQOSAF4BOUD77OTE2
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Wallet Integration**: 
  - Stellar: @creit.tech/stellar-wallets-kit
- **State Management**: React Query
- **Styling**: Tailwind CSS, Framer Motion
- **Notifications**: React Toastify

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/armsves/StellarProductHunt.git
cd StellarProductHunt
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Fill in the required environment variables in `.env.local`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# API Keys (if needed)
GITHUB_API_KEY=your_github_api_key
TWITTER_API_KEY=your_twitter_api_key
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- GitHub: [@armsves](https://github.com/armsves)
- Twitter: [@armsves](https://twitter.com/armsves)

## Video Demo

- https://youtu.be/Y4UKeDV8vEY

# Twitter API Integration

This project includes a Twitter API integration that analyzes the freshness of Twitter activity for projects. 

## Setup

1. Add your Twitter API credentials to the `.env.local` file:

```
# Twitter API (RapidAPI)
TWITTER_RAPIDAPI_KEY=a94785facfmsh8a58956c7a107a5p12f55djsn2cd3f46f9a6f
TWITTER_RAPIDAPI_HOST=twitter241.p.rapidapi.com
```

## Testing

You can test the Twitter API integration by visiting:
```
http://localhost:3000/api/twitter/test?username=MrBeast
```

Or fetch data for a specific Twitter user:
```
http://localhost:3000/api/twitter/MrBeast
```

## Freshness Classification

The Twitter activity freshness is classified as:

- **Active**: Tweeted within the last month
- **Semi-active**: Tweeted within the last 3 months
- **Inactive**: No tweets in over 3 months

This classification is displayed in the project cards with color-coded indicators.