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
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Compile contracts
echo "🔨 Compiling smart contracts..."
npm run compile

echo "✅ Setup complete!"
echo ""
echo "🎉 Next steps:"
echo "1. Edit .env file with your configuration (optional for local development)"
echo "2. Start local Hardhat network: npx hardhat node"
echo "3. Deploy contracts: npm run deploy"
echo "4. Start frontend: npm start"
echo ""
echo "📚 For more information, see README.md"
