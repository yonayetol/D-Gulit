require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        // Local development network (default)
        hardhat: {
            chainId: 1337,
            // Automatically fund accounts with ETH for testing
            accounts: {
                count: 10,
                initialIndex: 0,
                mnemonic: "test test test test test test test test test test test junk",
                path: "m/44'/60'/0'/0",
                accountsBalance: "10000000000000000000000", // 10,000 ETH per account
            },
        },
        // Local network for frontend connection
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 1337,
        },
        // Sepolia testnet (only if you want to deploy to testnet)
        sepolia: {
            url: process.env.SEPOLIA_URL || "",
            accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
            chainId: 11155111,
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};
