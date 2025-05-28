import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Sample projects to seed
const projects = [
  {
    name: 'Soroswap',
    description: 'A decentralized exchange (DEX) built on the Stellar network, allowing users to swap tokens directly from their wallets.',
    website: 'https://soroswap.finance',
    githubUrl: 'https://github.com/soroswap',
    twitterUrl: 'https://twitter.com/soroswap',
    logoUrl: 'https://soroswap.finance/logo.png',
    blockchain: 'stellar',
    categories: ['DeFi', 'Dapps'], // Categories to connect
    contracts: [
      {
        name: 'Soroswap Router',
        address: 'CBUUOWVZZK5TBDM3PHNFQOBTY42Q5YL5VVMYJ43CUCCUQZZGZRX5XSUF',
        type: 'Router',
        interactions: 1250
      },
      {
        name: 'Soroswap Factory',
        address: 'CBHPKQVQK3JY5PXYNVQN7RL4HLSXBG6SLJIRGCBYDMYQ3JDYY7HRKLC7',
        type: 'Factory',
        interactions: 750
      }
    ]
  },
  {
    name: 'Stellar Expert',
    description: 'A comprehensive block explorer and analytics platform for the Stellar network.',
    website: 'https://stellar.expert',
    githubUrl: 'https://github.com/stellar-expert',
    twitterUrl: 'https://twitter.com/stellarexpert',
    logoUrl: 'https://stellar.expert/img/logo.png',
    blockchain: 'stellar',
    categories: ['Block Explorers', 'Infra'], // Categories to connect
    contracts: [
      {
        name: 'StellarExpert Analytics',
        address: 'CCKDH3PVBLKIHJRVFZLNOWT7Q4ZDSVQQYJYZPJPHO4JBKFWIDG4NHKPI',
        type: 'Analytics',
        interactions: 3200
      }
    ]
  },
  {
    name: 'Lumenswap',
    description: 'An open-source platform for trading assets on the Stellar network with a focus on simplicity and efficiency.',
    website: 'https://lumenswap.io',
    githubUrl: 'https://github.com/lumenswap',
    twitterUrl: 'https://twitter.com/lumenswap',
    logoUrl: 'https://lumenswap.io/logo.png',
    blockchain: 'stellar',
    categories: ['DeFi', 'Dapps'], // Categories to connect
    contracts: [
      {
        name: 'Lumenswap AMM',
        address: 'CBHWHTZP3KQAQCYNLGBAAOSDIAGQ6BGV7P5X7ZXKKFMJ5RGAPPEJCCUZ',
        type: 'AMM',
        interactions: 1850
      }
    ]
  },
  {
    name: 'StellarNFT',
    description: 'A platform for creating, buying, and selling NFTs on the Stellar blockchain.',
    website: 'https://stellarnft.com',
    githubUrl: 'https://github.com/stellarnft',
    twitterUrl: 'https://twitter.com/stellarnft',
    logoUrl: 'https://stellarnft.com/logo.png',
    blockchain: 'stellar',
    categories: ['NFTs', 'Dapps'], // Categories to connect
    contracts: [
      {
        name: 'StellarNFT Marketplace',
        address: 'CCBPZUXLBXPCAAKJRQLKMOTYIPQ3WYAHLBUPX2G456ITZOHWAWJ5DJRZ',
        type: 'Marketplace',
        interactions: 920
      },
      {
        name: 'StellarNFT Minter',
        address: 'CDKHGLXHXFGCJPVXC3DSNHTQPB6AIZVDHFPZAFBUWIBVOZSDLMRMQ5V3',
        type: 'Minter',
        interactions: 680
      }
    ]
  },
  {
    name: 'StellarDAO',
    description: 'A framework for creating and managing decentralized autonomous organizations on Stellar.',
    website: 'https://stellardao.org',
    githubUrl: 'https://github.com/stellardao',
    twitterUrl: 'https://twitter.com/stellardao',
    logoUrl: 'https://stellardao.org/logo.png',
    blockchain: 'stellar',
    categories: ['DAOs', 'Infra'], // Categories to connect
    contracts: [
      {
        name: 'StellarDAO Governance',
        address: 'CAWLAYZUOIXGZ6KJO4YKMIQW37PMDKVCM4PTJBNAXBXBWZ7OFEVVQDDE',
        type: 'Governance',
        interactions: 520
      },
      {
        name: 'StellarDAO Treasury',
        address: 'CAGZIZC6J54GJ7BLLWGXBLVKNJGOJK65PWXGZBOVFMIZ4QRSWBLW3ZUR',
        type: 'Treasury',
        interactions: 320
      }
    ]
  },
  {
    name: 'Cosmic Horizon',
    description: 'A space-themed game built on Stellar where players can explore, trade resources, and build their galactic empire.',
    website: 'https://cosmichorizon.game',
    githubUrl: 'https://github.com/cosmichorizon',
    twitterUrl: 'https://twitter.com/cosmichorizon',
    logoUrl: 'https://cosmichorizon.game/logo.png',
    blockchain: 'stellar',
    categories: ['Gaming', 'NFTs'], // Categories to connect
    contracts: [
      {
        name: 'Cosmic Items',
        address: 'CBVLCWUJQVW5MNYFXRAORY25WSB6K6WKKIVMVCFSWGJTK5JGJQM75MRI',
        type: 'Items',
        interactions: 1750
      },
      {
        name: 'Cosmic Gameplay',
        address: 'CDRGMYMOLC3NHWGKADEKR6LZBVB3AI4QC547PGX73VLZM5BH54EAEN2P',
        type: 'Game Logic',
        interactions: 2250
      }
    ]
  }
];

async function main() {
  console.log(`Start seeding projects...`);
  
  for (const projectData of projects) {
    try {
      // Check if project already exists to avoid duplicates
      const existingProject = await prisma.project.findFirst({
        where: {
          name: projectData.name
        }
      });
      
      if (existingProject) {
        console.log(`Project already exists: ${projectData.name} (ID: ${existingProject.id})`);
        continue;
      }
      
      // Find category IDs
      const categoryPromises = projectData.categories.map(categoryName => 
        prisma.category.findFirst({
          where: { name: { equals: categoryName, mode: 'insensitive' } }
        })
      );
      
      const categories = await Promise.all(categoryPromises);
      const categoryIds = categories
        .filter(category => category !== null)
        .map(category => ({ id: category!.id }));
        
      if (categoryIds.length !== projectData.categories.length) {
        console.warn(`Warning: Not all categories found for project ${projectData.name}`);
      }
      
      // Create the project with categories and contracts
      const created = await prisma.project.create({
        data: {
          name: projectData.name,
          description: projectData.description,
          website: projectData.website,
          githubUrl: projectData.githubUrl,
          twitterUrl: projectData.twitterUrl,
          logoUrl: projectData.logoUrl,
          blockchain: projectData.blockchain,
          categories: {
            connect: categoryIds
          },
          socialMetrics: {
            create: {
              githubStars: Math.floor(Math.random() * 5000),
              githubForks: Math.floor(Math.random() * 1000),
              twitterFollowers: Math.floor(Math.random() * 10000),
              projectFreshness: Math.random() * 10
            }
          },
          contracts: {
            create: projectData.contracts.map(contract => ({
              name: contract.name,
              address: contract.address,
              type: contract.type,
              interactions: contract.interactions,
              lastInteraction: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
            }))
          }
        }
      });
      
      console.log(`Created project: ${created.name} (ID: ${created.id}) with ${categoryIds.length} categories and ${projectData.contracts.length} contracts`);
    } catch (error) {
      console.error(`Error creating project ${projectData.name}:`, error);
    }
  }
  
  console.log(`Seeding projects finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 