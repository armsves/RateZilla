# Ratezilla - Web3 Project Discovery Platform

Ratezilla is a decentralized platform for discovering, rating, and reviewing Web3 projects across multiple blockchain ecosystems. Built with Next.js and TypeScript, it provides a seamless experience for users to explore and evaluate projects on Stellar, Aptos, Bahamut, and Polkadot networks.

## Features

- 🔍 Cross-chain project discovery
- ⭐ Project rating and review system
- 💼 Multi-chain wallet integration
- 📊 Social metrics integration (GitHub, Twitter)
- 🎯 Project activity tracking
- 🔐 Secure wallet connections

## Supported Blockchains

- **Stellar**: Fast, secure, and low-cost blockchain for payments and tokenization
- **Aptos**: Layer 1 blockchain built for safety, scalability, and reliability
- **Bahamut**: Eco-friendly blockchain platform for DeFi and NFTs
- **Polkadot**: Multi-chain network enabling cross-chain interoperability

## Smart Contracts

### Stellar Contract
```
CCR6QKTWZQYW6YUJ7UP7XXZRLWQPFRV6SWBLQS4ZQOSAF4BOUD77OTE2
```

### Polkadot Westend Contract
```
0xad2a1952c9F3b2DB42e306A71635Fedb570679Db
```

### Bahamut Contract
```
0x4706EFBfD1b0dEf4F426C000B233232B7d4b78F4
```

### Aptos Contract
```
0x5f6532c97b22731de526f57d8a7f159ec21154ef3b6c0f5f09a9fb0f7abc3122
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Wallet Integration**: 
  - Stellar: @creit.tech/stellar-wallets-kit
  - EVM Chains: @rainbow-me/rainbowkit, wagmi
- **State Management**: React Query
- **Styling**: Tailwind CSS, Framer Motion
- **Notifications**: React Toastify

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/armsves/RateZilla.git
cd RateZilla
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
# WalletConnect Project ID
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

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