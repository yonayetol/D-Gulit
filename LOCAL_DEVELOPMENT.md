# 🚀 Local Development Guide

This guide will help you run the decentralized marketplace DApp completely locally without needing any sensitive information or external services.

## ✅ What You Need

- **Node.js** (v16 or higher)
- **MetaMask** browser extension
- **No private keys or API keys needed!**

## 🎯 Quick Start (3 Commands)

```bash
# 1. Setup everything
npm run install:all

# 2. Start local blockchain
npx hardhat node

# 3. Deploy contracts (in new terminal)
npm run deploy
```

## 📋 Detailed Setup

### Step 1: Install Dependencies
```bash
# Install all dependencies
npm run install:all
```

### Step 2: Start Local Blockchain
```bash
# Start Hardhat local network
npx hardhat node
```
This will:
- Start a local Ethereum network on `http://localhost:8545`
- Create 10 test accounts with 10,000 ETH each
- Display account addresses and private keys

### Step 3: Deploy Smart Contracts
```bash
# In a new terminal, deploy contracts
npm run deploy
```
This will:
- Deploy the Marketplace contract to your local network
- Save the contract address for the frontend
- Display helpful next steps

### Step 4: Start Frontend
```bash
# Start the React frontend
npm start
```
This will:
- Start the frontend on `http://localhost:3000`
- Automatically connect to your local blockchain

### Step 5: Connect MetaMask
1. Open MetaMask
2. Click the network dropdown (top of MetaMask)
3. Select "Add Network" → "Add a network manually"
4. Enter these details:
   - **Network Name**: `Localhost 8545`
   - **RPC URL**: `http://localhost:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
5. Click "Save"

### Step 6: Import Test Account (Optional)
If you want to use a test account with lots of ETH:
1. In MetaMask, click the account icon (top right)
2. Select "Import Account"
3. Copy a private key from the Hardhat node terminal
4. Paste it and click "Import"

## 🔧 Configuration Files

### `.env` File (Auto-created)
The setup script automatically creates a `.env` file with safe local development settings:
```env
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
```

### Hardhat Configuration
- **Local Network**: `http://localhost:8545` (Chain ID: 1337)
- **Test Accounts**: 10 accounts with 10,000 ETH each
- **No Private Keys**: Uses test mnemonic for development

## 🧪 Testing the DApp

1. **Connect Wallet**: Click "Connect Wallet" in the app
2. **List an Item**: 
   - Go to "List Item" tab
   - Fill out the form (name, description, price)
   - Submit transaction
3. **Buy an Item**:
   - Go to "Marketplace" tab
   - Click "Buy" on any item
   - Confirm transaction in MetaMask
4. **View Your Items**: Check "My Items" tab

## 🛠️ Development Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to local network
npm run deploy

# Start frontend
npm start

# Build frontend for production
npm run build
```

## 🔍 Troubleshooting

### "Contract not loaded" Error
- Make sure you've deployed the contract: `npm run deploy`
- Check that the contract address is saved in `frontend/src/contracts/contract-address.json`

### MetaMask Connection Issues
- Ensure MetaMask is connected to `localhost:8545`
- Check that Chain ID is set to `1337`
- Try refreshing the page

### "Insufficient funds" Error
- Import a test account from the Hardhat node terminal
- Test accounts have 10,000 ETH each

### Frontend Won't Start
- Make sure you're in the project root directory
- Run `npm run install:frontend` to install frontend dependencies

## 🎉 You're Ready!

Your local development environment is now set up with:
- ✅ Local Ethereum blockchain
- ✅ Smart contracts deployed
- ✅ React frontend running
- ✅ MetaMask connected
- ✅ Test accounts with ETH

**No sensitive information needed!** Everything runs locally and securely.

## 🚀 Next Steps

- Try listing and buying items
- Modify the smart contract code
- Customize the frontend UI
- Add new features
- Run the test suite

Happy coding! 🎊
