const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to generate random rating between 2.5 and 5.0
function getRandomRating() {
  return Math.floor(Math.random() * 25 + 25) / 10; // This gives us values from 2.5 to 5.0
}

async function main() {
  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.vote.deleteMany();
  await prisma.socialMetrics.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  console.log('Existing data cleared.');

  // Create 5 dummy users
  const dummyUsers = [];
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        stellarAddress: `GUSERDUMMYADDRESS${i}`
      }
    });
    dummyUsers.push(user);
  }

  // Stellar Projects
  const stellarProjects = [
    {
        name: 'Blend',
        description: 'Blend Capital Protocol',
        website: 'https://docs.blend.capital/mainnet-deployments',
        githubUrl: 'https://github.com/blend-capital',
        twitterUrl: 'https://x.com/blend_capital',
        logoUrl: 'https://881490810-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FLg1UeA72WAt02V2TIIga%2Fuploads%2FGE2anbigA52J1BnuRV2n%2FBlend%20Logo.png?alt=media&token=8e2d4aaa-da25-4296-a7a3-64194b4a702b&width=400&dpr=3&quality=100&sign=9d9d3fb7&sv=2',
      blockchain: 'stellar'
    },
    {
        name: 'FxDAO',
        description: 'FxDAO Protocol',
        website: 'https://fxdao.io/',
        githubUrl: 'https://github.com/FxDAO/',
        twitterUrl: 'https://x.com/FxDAO_io',
        logoUrl: 'https://assets.fxdao.io/brand/FxDAO-logo.svg',
      blockchain: 'stellar'
    },
    {
        name: 'Soroswap',
        description: 'Soroswap Finance',
        website: 'https://app.soroswap.finance/',
        githubUrl: 'https://github.com/soroswap/',
        twitterUrl: 'https://x.com/SoroswapFinance',
        logoUrl: 'https://app.soroswap.finance/_next/static/media/SoroswapPurpleWhite.e3b44969.svg',
      blockchain: 'stellar'
    },
    {
        name: 'Phoenix-hub',
        description: 'Phoenix Protocol',
        website: 'https://www.phoenix-hub.io/',
        githubUrl: 'https://github.com/Phoenix-Protocol-Group',
        twitterUrl: 'https://x.com/PhoenixDefiHub',
        logoUrl: 'https://avatars.githubusercontent.com/u/133277324?s=200&v=4',
      blockchain: 'stellar'
    },
    {
        name: 'Aquarius',
        description: 'Aqua Network',
        website: 'https://aqua.network/',
        githubUrl: 'https://github.com/AquaToken',
        twitterUrl: 'https://x.com/aqua_token',
        logoUrl: 'https://static.ultrastellar.com/media/assets/img/1878ee2d-2fd1-4e31-89a7-5a430f1596f8.png',
      blockchain: 'stellar'
    },
    {
        name: 'KALE farm',
        description: 'KALE Farm Protocol',
        website: 'https://kalefarm.xyz/',
        githubUrl: 'https://github.com/kalepail/KALE-sc',
        twitterUrl: 'https://x.com/kaleonstellar',
        logoUrl: '🥬',
      blockchain: 'stellar'
    }
  ];

  // Add all projects with random ratings
  for (const project of stellarProjects) {
    const createdProject = await prisma.project.create({
      data: {
        ...project,
        socialMetrics: {
                create: {
            githubStars: 0,
            githubForks: 0,
            twitterFollowers: 0,
            projectFreshness: 0
                }
        }
      }
    });

    // Add 5 random votes for each project to create an average rating
    for (let i = 0; i < 5; i++) {
      await prisma.vote.create({
        data: {
          projectId: createdProject.id,
          userId: dummyUsers[i].id,
          value: Math.round(getRandomRating() * 2) / 2, // Round to nearest 0.5
            }
        });
    }
  }

  console.log('Database has been seeded with Stellar projects and random ratings. 🌱');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 