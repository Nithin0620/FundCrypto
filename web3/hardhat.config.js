import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  zksolc: {
    version: "1.4.1",
    compilerSource: "binary",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  defaultNetwork:'sepolia',
  networks: {
    hardhat:{},
    sepolia:{
      url:'https://eth-sepolia.g.alchemy.com/public',
      accounts:[`0x${process.env.PRIVATE_KEY}`],
    },
    // zkSyncSepoliaTestnet: {
    //   url: "https://sepolia.era.zksync.dev",
    //   ethNetwork: "sepolia",
    //   zksync: true,
    //   chainId: 300,
    //   verifyURL:
    //     "https://explorer.sepolia.era.zksync.dev/contract_verification",
    // },
    zkSyncMainnet: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet",
      zksync: true,
      chainId: 324,
      verifyURL:
        "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
    },
  },
  paths: {
    artifacts: "./artifacts-zk",
    cache: "./cache-zk",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
