const hre = require("hardhat");

async function main() {
    console.log("Deploying Marketplace contract...");

    const Marketplace = await hre.ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy();

    await marketplace.waitForDeployment();

    const contractAddress = await marketplace.getAddress();

    console.log("Marketplace deployed to:", contractAddress);
    console.log("Contract owner:", await marketplace.owner());

    // Save contract address for frontend
    const fs = require('fs');
    const contractInfo = {
        address: contractAddress,
        network: hre.network.name,
        chainId: hre.network.config.chainId
    };

    fs.writeFileSync(
        './frontend/src/contracts/contract-address.json',
        JSON.stringify(contractInfo, null, 2)
    );

    console.log("Contract address saved to frontend/src/contracts/contract-address.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
