const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying Marketplace contract...");
    console.log("Network:", hre.network.name);
    console.log("Chain ID:", hre.network.config.chainId);

    // Get the signer (will use MetaMask if available)
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    
    // Check if deployer has enough ETH
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
        console.log("⚠️  Warning: Account has no ETH. This might fail on testnets.");
    }

    const Marketplace = await hre.ethers.getContractFactory("Marketplace");
    console.log("📝 Deploying contract...");
    
    const marketplace = await Marketplace.deploy();
    await marketplace.waitForDeployment();

    const contractAddress = await marketplace.getAddress();

    console.log("✅ Marketplace deployed to:", contractAddress);
    console.log("👤 Contract owner:", await marketplace.owner());

    // Save contract address for frontend
    const fs = require('fs');
    const contractInfo = {
        address: contractAddress,
        network: hre.network.name,
        chainId: hre.network.config.chainId,
        deployedAt: new Date().toISOString()
    };

    // Ensure the directory exists
    const dir = './frontend/src/contracts';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(
        './frontend/src/contracts/contract-address.json',
        JSON.stringify(contractInfo, null, 2)
    );

    console.log("💾 Contract address saved to frontend/src/contracts/contract-address.json");
    
    // Display next steps
    console.log("\n🎉 Deployment complete!");
    console.log("Next steps:");
    console.log("1. Start the frontend: npm start");
    console.log("2. Open http://localhost:3000");
    console.log("3. Connect MetaMask to localhost:8545");
    console.log("4. Import one of the test accounts if needed");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
