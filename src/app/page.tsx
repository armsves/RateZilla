import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const blockchains = [
    {
      name: 'Stellar',
      logo: 'https://cdn.sanity.io/images/e2r40yh6/production-i18n/502d9b1bbee8c2169cc0eb3d0982ba3bf02ce300-1776x548.png',
      path: '/stellar',
      description: 'Fast, secure, and low-cost blockchain for payments and tokenization'
    },
    {
      name: 'Aptos',
      logo: 'https://aptosfoundation.org/brandbook/logotype/PNG/Aptos_Primary_BLK.png',
      path: '/aptos',
      description: 'Layer 1 blockchain built for safety, scalability, and reliability'
    },
    {
      name: 'Bahamut',
      logo: 'https://cdn.ucraft.com/fs/user_files/208091/media/images/Bahamut-logo-white-bg.svg',
      path: '/bahamut',
      description: 'Eco-friendly blockchain platform for DeFi and NFTs'
    },
    {
      name: 'Polkadot',
      logo: 'https://polkadot.com/_next/static/media/polkadot-logo.0e1e2c79.png',
      path: '/polkadot',
      description: 'Multi-chain network enabling cross-chain interoperability'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        Rate, Review, and Discover Web3 Projects Across Multiple Chains
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
        {blockchains.map((blockchain) => (
          <Link 
            href={blockchain.path}
            key={blockchain.name}
            className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative w-48 h-48 mb-4">
                <Image
                  src={blockchain.logo}
                  alt={`${blockchain.name} logo`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">{blockchain.name}</h2>
              <p className="text-gray-600">{blockchain.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
