const hre = require("hardhat");

async function main() {
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy contract
  const FundCrypto = await hre.ethers.getContractFactory("FundCrypto"); // contract name
  const fundCrypto = await FundCrypto.deploy(
    "0xYourPriceFeedAddressHere" // constructor arg (like ETH/USD feed address)
  );

  await fundMe.deployed();
  console.log("FundCrypto deployed to:", fundCrypto.address);
}

// Run main
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
