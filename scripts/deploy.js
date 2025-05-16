const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  // Get the private key from .env file
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Please set PRIVATE_KEY in your .env file");
  }

  // Connect to Westend AssetHub
  const provider = new ethers.providers.JsonRpcProvider(process.env.WESTEND_RPC_URL || "https://westend-asset-hub-rpc.polkadot.io");
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying contracts with the account:", wallet.address);

  // Get the contract factory
  const ProjectRating = await ethers.getContractFactory("ProjectRating");

  // Deploy the contract
  const projectRating = await ProjectRating.deploy();
  await projectRating.deployed();

  console.log("ProjectRating deployed to:", projectRating.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 