import { ProjectService } from './projectService';

const projects = [
    {
        name: 'Blend',
        description: 'Blend Capital Protocol',
        website: 'https://docs.blend.capital/mainnet-deployments',
        githubUrl: 'https://github.com/blend-capital',
        twitterUrl: 'https://x.com/blend_capital',
        contracts: [
            {
                name: 'Blend USDC-XLM Pool',
                address: 'CDVQVKOY2YSXS2IC7KN6MNASSHPAO7UN2UR2ON4OI2SKMFJNVAMDX6DP',
                type: 'Pool'
            },
            {
                name: 'Blend Backstop Pool',
                address: 'CAO3AGAMZVRMHITL36EJ2VZQWKYRPWMQAPDQD5YEOF3GIF7T44U4JAL3',
                type: 'Pool'
            },
            {
                name: 'Blend LP Comet Pool',
                address: 'CAS3FL6TLZKDGGSISDBWGGPXT3NRR4DYTZD7YOD3HMYO6LTJUVGRVEAM',
                type: 'Pool'
            },
            {
                name: 'Blend Pool Factory',
                address: 'CCZD6ESMOGMPWH2KRO4O7RGTAPGTUPFWFQBELQSS7ZUK63V3TZWETGAG',
                type: 'Factory'
            },
            {
                name: 'Blend Emitter',
                address: 'CCZD6ESMOGMPWH2KRO4O7RGTAPGTUPFWFQBELQSS7ZUK63V3TZWETGAG',
                type: 'Emitter'
            },
            {
                name: 'Blend Token',
                address: 'CD25MNVTZDL4Y3XBCPCJXGXATV5WUHHOWMYFF4YBEGU5FCPGMYTVG5JY',
                type: 'Token'
            },
            {
                name: 'Blend Yieldblox Pool',
                address: 'CBP7NO6F7FRDHSOFQBT2L2UWYIZ2PU76JKVRYAQTG3KZSQLYAOKIF2WB',
                type: 'Pool'
            }
        ]
    },
    {
        name: 'FxDAO',
        description: 'FxDAO Protocol',
        website: 'https://fxdao.io/',
        githubUrl: 'https://github.com/FxDAO/',
        twitterUrl: 'https://x.com/FxDAO_io',
        contracts: [
            {
                name: 'FxDAO Liquidity locking pool',
                address: 'CDCART6WRSM2K4CKOAOB5YKUVBSJ6KLOVS7ZEJHA4OAQ2FXX7JOHLXIP',
                type: 'Pool'
            },
            {
                name: 'FxDAO Vault',
                address: 'CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB',
                type: 'Vault'
            },
            {
                name: 'FxDAO Oracle',
                address: 'CB5OTV4GV24T5USEZHFVYGC3F4A4MPUQ3LN56E76UK2IT7MJ6QXW4TFS',
                type: 'Oracle'
            }
        ]
    },
    {
        name: 'Soroswap',
        description: 'Soroswap Finance',
        website: 'https://app.soroswap.finance/',
        githubUrl: 'https://github.com/soroswap/',
        twitterUrl: 'https://x.com/SoroswapFinance',
        contracts: [
            {
                name: 'Soroswap',
                address: 'CA4HEQTL2WPEUYKYKCDOHCDNIV4QHNJ7EL4J4NQ6VADP7SYHVRYZ7AW2',
                type: 'DEX'
            },
            {
                name: 'Soroswap',
                address: 'CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH',
                type: 'DEX'
            }
        ]
    },
    {
        name: 'Phoenix-hub',
        description: 'Phoenix Protocol',
        website: 'https://www.phoenix-hub.io/',
        githubUrl: 'https://github.com/Phoenix-Protocol-Group',
        twitterUrl: 'https://x.com/PhoenixDefiHub',
        contracts: [
            {
                name: 'Phoenix AMM',
                address: 'CCLZRD4E72T7JCZCN3P7KNPYNXFYKQCL64ECLX7WP5GNVYPYJGU2IO2G',
                type: 'AMM'
            }
        ]
    },
    {
        name: 'Aquarius',
        description: 'Aqua Network',
        website: 'https://aqua.network/',
        githubUrl: 'https://github.com/AquaToken',
        twitterUrl: 'https://x.com/aqua_token',
        contracts: [
            {
                name: 'Aqua Rewards',
                address: 'CCY2PXGMKNQHO7WNYXEWX76L2C5BH3JUW3RCATGUYKY7QQTRILBZIFWV',
                type: 'Rewards'
            },
            {
                name: 'Aqua AMM',
                address: 'CBQDHNBFBZYE4MKPWBSJOPIYLW4SFSXAXUTSXJN76GNKYVYPCKWC6QUK',
                type: 'AMM'
            }
        ]
    },
    {
        name: 'KALE farm',
        description: 'KALE Farm Protocol',
        website: 'https://kalefarm.xyz/',
        githubUrl: 'https://github.com/kalepail/KALE-sc',
        twitterUrl: 'https://x.com/kaleonstellar',
        contracts: [
            {
                name: 'KALE Contract',
                address: 'CDL74RF5BLYR2YBLCCI7F5FB6TPSCLKEJUBSD2RSVWZ4YHF3VMFAIGWA',
                type: 'Farm'
            },
            {
                name: 'KALE SAC',
                address: 'CB23WRDQWGSP6YPMY4UV5C4OW5CBTXKYN3XEATG7KJEZCXMJBYEHOUOV',
                type: 'SAC'
            }
        ]
    }
];

async function initializeProjects() {
    const projectService = new ProjectService();
    
    for (const projectData of projects) {
        try {
            await projectService.createProject(projectData);
            console.log(`Created project: ${projectData.name}`);
        } catch (error) {
            console.error(`Error creating project ${projectData.name}:`, error);
        }
    }
}

// Run the initialization
initializeProjects().then(() => {
    console.log('Project initialization complete');
}).catch(error => {
    console.error('Error during project initialization:', error);
}); 