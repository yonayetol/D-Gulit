#!/bin/bash

echo "🚀 Setting up Decentralized Marketplace DApp..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file for local development..."
    cat > .env << 'EOF'
# ===========================================
# LOCAL DEVELOPMENT CONFIGURATION
# ===========================================
# For local development, these settings work out of the box
# No sensitive information needed!

# Local Hardhat network configuration
HARDHAT_NETWORK_URL=http://localhost:8545
HARDHAT_CHAIN_ID=1337

# Frontend configuration for local development
REACT_APP_NETWORK_ID=1337
REACT_APP_NETWORK_NAME=localhost

# ===========================================
# TESTNET DEPLOYMENT (OPTIONAL)
# ===========================================
# WARNING: Never commit your private key to version control!
# Only uncomment and fill these if you want to deploy to Sepolia testnet

# Sepolia testnet configuration (OPTIONAL)
# SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
# PRIVATE_KEY=your_private_key_here

# Testnet frontend configuration (OPTIONAL)
# REACT_APP_NETWORK_ID=11155111
# REACT_APP_NETWORK_NAME=sepolia
EOF
    echo "✅ .env file created with local development settings"
    echo "ℹ️  No sensitive information needed for local development!"
fi

# Compile contracts
echo "🔨 Compiling smart contracts..."
npm run compile

echo "✅ Setup complete!"
echo ""
echo "🎉 Next steps:"
echo "1. Start local Hardhat network: npx hardhat node"
echo "2. Deploy contracts: npm run deploy"
echo "3. Start frontend: npm start"
echo "4. Open http://localhost:3000 and connect MetaMask"
echo ""
echo "📚 For more information, see README.md"
