const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

// New projects to seed with categories
const stellarProjects = [
  {
    name: 'Blend',
    description: 'Blend Capital Protocol',
    website: 'https://docs.blend.capital/mainnet-deployments',
    githubUrl: 'https://github.com/blend-capital',
    twitterUrl: 'https://x.com/blend_capital',
    logoUrl: 'https://881490810-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FLg1UeA72WAt02V2TIIga%2Fuploads%2FGE2anbigA52J1BnuRV2n%2FBlend%20Logo.png?alt=media&token=8e2d4aaa-da25-4296-a7a3-64194b4a702b&width=400&dpr=3&quality=100&sign=9d9d3fb7&sv=2',
    blockchain: 'stellar',
    categories: ['DeFi']
  },
  {
    name: 'FxDAO',
    description: 'FxDAO Protocol',
    website: 'https://fxdao.io/',
    githubUrl: 'https://github.com/FxDAO/',
    twitterUrl: 'https://x.com/FxDAO_io',
    logoUrl: 'https://assets.fxdao.io/brand/FxDAO-logo.svg',
    blockchain: 'stellar',
    categories: ['DAOs']
  },
  {
    name: 'Soroswap',
    description: 'Soroswap Finance',
    website: 'https://app.soroswap.finance/',
    githubUrl: 'https://github.com/soroswap/',
    twitterUrl: 'https://x.com/SoroswapFinance',
    logoUrl: 'https://app.soroswap.finance/_next/static/media/SoroswapPurpleWhite.e3b44969.svg',
    blockchain: 'stellar',
    categories: ['DeFi']
  },
  {
    name: 'Phoenix-hub',
    description: 'Phoenix Protocol',
    website: 'https://www.phoenix-hub.io/',
    githubUrl: 'https://github.com/Phoenix-Protocol-Group',
    twitterUrl: 'https://x.com/PhoenixDefiHub',
    logoUrl: 'https://avatars.githubusercontent.com/u/133277324?s=200&v=4',
    blockchain: 'stellar',
    categories: ['DeFi']
  },
  {
    name: 'Aquarius',
    description: 'Aqua Network',
    website: 'https://aqua.network/',
    githubUrl: 'https://github.com/AquaToken',
    twitterUrl: 'https://x.com/aqua_token',
    logoUrl: 'https://static.ultrastellar.com/media/assets/img/1878ee2d-2fd1-4e31-89a7-5a430f1596f8.png',
    blockchain: 'stellar',
    categories: ['Infra']
  },
  {
    name: 'KALE farm',
    description: 'KALE Farm Protocol',
    website: 'https://kalefarm.xyz/',
    githubUrl: 'https://github.com/kalepail/KALE-sc',
    twitterUrl: 'https://x.com/kaleonstellar',
    logoUrl: '🥬',
    blockchain: 'stellar',
    categories: ['DeFi']
  }
];

async function main() {
  console.log(`Start seeding new projects...`);
  
  for (const projectData of stellarProjects) {
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
        .map(category => ({ id: category.id }));
        
      if (categoryIds.length !== projectData.categories.length) {
        console.warn(`Warning: Not all categories found for project ${projectData.name}`);
      }
      
      // Create the project with categories
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
          }
        }
      });
      
      console.log(`Created project: ${created.name} (ID: ${created.id}) with ${categoryIds.length} categories`);
    } catch (error) {
      console.error(`Error creating project ${projectData.name}:`, error);
    }
  }
  
  console.log(`Seeding new projects finished.`);
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