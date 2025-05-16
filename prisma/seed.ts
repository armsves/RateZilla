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

  // Aptos Projects
  const aptosProjects = [
    {
      name: 'Panora',
      description: 'Smart DEX Aggregator.',
      website: 'https://panora.exchange/',
      githubUrl: 'https://github.com/PanoraExchange',
      twitterUrl: 'https://x.com/PanoraExchange',
      logoUrl: 'https://media.aptosfoundation.org/1710268412-photo_2024-03-12_11-32-47.jpg?auto=format&fit=crop&h=344&w=344',
      blockchain: 'aptos'
    },
    {
      name: 'Aptos Art Museum',
      description: 'The first metaverse art gallery in the Aptos ecosystem',
      website: 'https://game.aptosartmuseum.online/',
      githubUrl: 'https://github.com/10ur5en/aptos-art-museum',
      twitterUrl: 'https://x.com/AptosArtMuseum',
      logoUrl: 'https://media.aptosfoundation.org/1698966475-project-icon_aptos-art-museum.jpg?auto=format&fit=crop&h=344&w=344',
      blockchain: 'aptos'
    },
    {
      name: 'Cellana Finance',
      description: 'The first Aptos DEX which uses the Ve(3,3) Model in Move.',
      website: 'https://cellana.finance/',
      githubUrl: 'https://github.com/Cellana-Finance',
      twitterUrl: 'https://x.com/CellanaFinance',
      logoUrl: 'https://media.aptosfoundation.org/1720457115-project-icon_cellana-finance.png?auto=format&fit=crop&h=344&w=344',
      blockchain: 'aptos'
    },
    {
      name: 'Econia',
      description: 'Hyper-parallelized On-chain Order Book for the Aptos Network Blockchain',
      website: 'https://econialabs.com/',
      githubUrl: 'https://github.com/econia-labs/econia',
      twitterUrl: 'https://x.com/EconiaLabs',
      logoUrl: 'https://media.aptosfoundation.org/1686929335-econia.jpeg?auto=format&fit=crop&h=344&w=344',
      blockchain: 'aptos'
    },
    {
      name: 'Werewolf vs Witch',
      description: 'Decentralized NFT War Game on Aptos',
      website: 'https://werewolfandwitch.xyz/',
      githubUrl: 'https://github.com/werewolfandwitch/aptos-werewolfandwitch',
      twitterUrl: 'https://x.com/AWW_xyz',
      logoUrl: 'https://media.aptosfoundation.org/1687173589-werewolf-vs-witch.jpeg?auto=format&fit=crop&h=344&w=344',
      blockchain: 'aptos'
    }
  ];

  // Bahamut Projects
  const bahamutProjects = [
    {
      name: 'Rubic',
      description: 'DEX aggregator on the Bahamut blockchain',
      website: 'https://rubic.exchange/',
      githubUrl: 'https://github.com/Cryptorubic',
      twitterUrl: 'https://x.com/CryptoRubic',
      logoUrl: 'https://rubic.exchange/assets/images/logo.svg',
      blockchain: 'bahamut'
    },
    {
      name: '8Legends',
      description: '8Legends is an NFT marketplace on the Bahamut blockchain',
      website: 'https://8legends.ai/',
      githubUrl: 'https://github.com/',
      twitterUrl: 'https://x.com/ArtLegends8',
      logoUrl: 'https://8legends.ai/webp/logo.webp',
      blockchain: 'bahamut'
    },
    {
      name: 'Symbiosis',
      description: 'Symbiosis Finance is a cross-chain bridge that supports the Bahamut blockchain',
      website: 'https://symbiosis.finance/',
      githubUrl: 'https://docs.symbiosis.finance/',
      twitterUrl: 'https://x.com/symbiosis_fi',
      logoUrl: 'https://docs.symbiosis.finance/~gitbook/image?url=https%3A%2F%2F1179234091-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MbqmbXNUH5sa4BvYwD0%252Ficon%252F7UCKgV59LkQo8gIo53PP%252Flogo%2520purple-solo.jpg%3Falt%3Dmedia%26token%3Db34b3705-7644-4baa-a2e2-65a57962ffd6&width=32&dpr=2&quality=100&sign=313adca5&sv=2',
      blockchain: 'bahamut'
    }
  ];

  // Polkadot Projects
  const polkadotProjects = [
    {
      name: 'Hydration',
      description: 'DEX for low-slippage trades',
      website: 'https://hydration.net/',
      githubUrl: 'https://github.com/galacticcouncil',
      twitterUrl: 'https://x.com/hydration_net',
      logoUrl: 'https://hydration.net/_next/static/media/logo.3349328f.svg',
      blockchain: 'polkadot'
    },
    {
      name: 'Hyperbridge',
      description: 'Verifiable Interoperability',
      website: 'https://hyperbridge.network/',
      githubUrl: 'https://github.com/polytope-labs/hyperbridge',
      twitterUrl: 'https://x.com/hyperbridge',
      logoUrl: 'https://hyperbridge.network/_nuxt/logo.b7UY1T-8.svg',
      blockchain: 'polkadot'
    },
    {
      name: 'Bitfrost',
      description: 'One Stake Endless Opportunities',
      website: 'https://www.bifrost.io/',
      githubUrl: 'https://github.com/bifrost-io',
      twitterUrl: 'https://x.com/Bifrost',
      logoUrl: 'https://www.bifrost.io/images/v4/logo.svg',
      blockchain: 'polkadot'
    }
  ];

  // Add all projects with random ratings
  for (const project of [...stellarProjects, ...aptosProjects, ...bahamutProjects, ...polkadotProjects]) {
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

  console.log('Database has been seeded with projects and random ratings. 🌱');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 