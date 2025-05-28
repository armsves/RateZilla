import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// List of initial categories to seed
const categories = [
  { name: 'Block Explorers', description: 'Tools for exploring and visualizing the blockchain' },
  { name: 'DAOs', description: 'Decentralized Autonomous Organizations' },
  { name: 'Dapps', description: 'Decentralized Applications' },
  { name: 'DeFi', description: 'Decentralized Finance applications and protocols' },
  { name: 'Gaming', description: 'Blockchain games and gaming platforms' },
  { name: 'Infra', description: 'Infrastructure and developer tools' },
  { name: 'NFTs', description: 'Non-Fungible Tokens and related platforms' },
];

async function main() {
  console.log(`Start seeding categories...`);
  
  for (const category of categories) {
    try {
      // Check if category already exists to avoid duplicates
      const existing = await prisma.category.findFirst({
        where: {
          name: category.name
        }
      });
      
      if (!existing) {
        const created = await prisma.category.create({
          data: category
        });
        console.log(`Created category: ${created.name} (ID: ${created.id})`);
      } else {
        console.log(`Category already exists: ${existing.name} (ID: ${existing.id})`);
      }
    } catch (error) {
      console.error(`Error creating category ${category.name}:`, error);
    }
  }
  
  console.log(`Seeding categories finished.`);
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