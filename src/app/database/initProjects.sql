-- Initialize projects data

-- Blend
INSERT INTO projects (name, description, website, github_url, twitter_url)
VALUES (
    'Blend',
    'Blend Capital Protocol',
    'https://docs.blend.capital/mainnet-deployments',
    'https://github.com/blend-capital',
    'https://x.com/blend_capital'
) RETURNING id INTO project_id;

INSERT INTO contracts (project_id, name, address, type)
VALUES
    (project_id, 'Blend USDC-XLM Pool', 'CDVQVKOY2YSXS2IC7KN6MNASSHPAO7UN2UR2ON4OI2SKMFJNVAMDX6DP', 'Pool'),
    (project_id, 'Blend Backstop Pool', 'CAO3AGAMZVRMHITL36EJ2VZQWKYRPWMQAPDQD5YEOF3GIF7T44U4JAL3', 'Pool'),
    (project_id, 'Blend LP Comet Pool', 'CAS3FL6TLZKDGGSISDBWGGPXT3NRR4DYTZD7YOD3HMYO6LTJUVGRVEAM', 'Pool'),
    (project_id, 'Blend Pool Factory', 'CCZD6ESMOGMPWH2KRO4O7RGTAPGTUPFWFQBELQSS7ZUK63V3TZWETGAG', 'Factory'),
    (project_id, 'Blend Emitter', 'CCZD6ESMOGMPWH2KRO4O7RGTAPGTUPFWFQBELQSS7ZUK63V3TZWETGAG', 'Emitter'),
    (project_id, 'Blend Token', 'CD25MNVTZDL4Y3XBCPCJXGXATV5WUHHOWMYFF4YBEGU5FCPGMYTVG5JY', 'Token'),
    (project_id, 'Blend Yieldblox Pool', 'CBP7NO6F7FRDHSOFQBT2L2UWYIZ2PU76JKVRYAQTG3KZSQLYAOKIF2WB', 'Pool');

INSERT INTO social_metrics (project_id) VALUES (project_id);

-- FxDAO
INSERT INTO projects (name, description, website, github_url, twitter_url)
VALUES (
    'FxDAO',
    'FxDAO Protocol',
    'https://fxdao.io/',
    'https://github.com/FxDAO/',
    'https://x.com/FxDAO_io'
) RETURNING id INTO project_id;

INSERT INTO contracts (project_id, name, address, type)
VALUES
    (project_id, 'FxDAO Liquidity locking pool', 'CDCART6WRSM2K4CKOAOB5YKUVBSJ6KLOVS7ZEJHA4OAQ2FXX7JOHLXIP', 'Pool'),
    (project_id, 'FxDAO Vault', 'CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB', 'Vault'),
    (project_id, 'FxDAO Oracle', 'CB5OTV4GV24T5USEZHFVYGC3F4A4MPUQ3LN56E76UK2IT7MJ6QXW4TFS', 'Oracle');

INSERT INTO social_metrics (project_id) VALUES (project_id);

-- Soroswap
INSERT INTO projects (name, description, website, github_url, twitter_url)
VALUES (
    'Soroswap',
    'Soroswap Finance',
    'https://app.soroswap.finance/',
    'https://github.com/soroswap/',
    'https://x.com/SoroswapFinance'
) RETURNING id INTO project_id;

INSERT INTO contracts (project_id, name, address, type)
VALUES
    (project_id, 'Soroswap', 'CA4HEQTL2WPEUYKYKCDOHCDNIV4QHNJ7EL4J4NQ6VADP7SYHVRYZ7AW2', 'DEX'),
    (project_id, 'Soroswap', 'CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH', 'DEX');

INSERT INTO social_metrics (project_id) VALUES (project_id);

-- Phoenix-hub
INSERT INTO projects (name, description, website, github_url, twitter_url)
VALUES (
    'Phoenix-hub',
    'Phoenix Protocol',
    'https://www.phoenix-hub.io/',
    'https://github.com/Phoenix-Protocol-Group',
    'https://x.com/PhoenixDefiHub'
) RETURNING id INTO project_id;

INSERT INTO contracts (project_id, name, address, type)
VALUES
    (project_id, 'Phoenix AMM', 'CCLZRD4E72T7JCZCN3P7KNPYNXFYKQCL64ECLX7WP5GNVYPYJGU2IO2G', 'AMM');

INSERT INTO social_metrics (project_id) VALUES (project_id);

-- Aquarius
INSERT INTO projects (name, description, website, github_url, twitter_url)
VALUES (
    'Aquarius',
    'Aqua Network',
    'https://aqua.network/',
    'https://github.com/AquaToken',
    'https://x.com/aqua_token'
) RETURNING id INTO project_id;

INSERT INTO contracts (project_id, name, address, type)
VALUES
    (project_id, 'Aqua Rewards', 'CCY2PXGMKNQHO7WNYXEWX76L2C5BH3JUW3RCATGUYKY7QQTRILBZIFWV', 'Rewards'),
    (project_id, 'Aqua AMM', 'CBQDHNBFBZYE4MKPWBSJOPIYLW4SFSXAXUTSXJN76GNKYVYPCKWC6QUK', 'AMM');

INSERT INTO social_metrics (project_id) VALUES (project_id);

-- KALE farm
INSERT INTO projects (name, description, website, github_url, twitter_url)
VALUES (
    'KALE farm',
    'KALE Farm Protocol',
    'https://kalefarm.xyz/',
    'https://github.com/kalepail/KALE-sc',
    'https://x.com/kaleonstellar'
) RETURNING id INTO project_id;

INSERT INTO contracts (project_id, name, address, type)
VALUES
    (project_id, 'KALE Contract', 'CDL74RF5BLYR2YBLCCI7F5FB6TPSCLKEJUBSD2RSVWZ4YHF3VMFAIGWA', 'Farm'),
    (project_id, 'KALE SAC', 'CB23WRDQWGSP6YPMY4UV5C4OW5CBTXKYN3XEATG7KJEZCXMJBYEHOUOV', 'SAC');

INSERT INTO social_metrics (project_id) VALUES (project_id); 