require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    westend: {
      url: process.env.WESTEND_RPC_URL || "https://westend-asset-hub-rpc.polkadot.io",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1000, // Westend AssetHub chain ID
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
}; 