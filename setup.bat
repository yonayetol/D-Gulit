@echo off
echo 🚀 Setting up Decentralized Marketplace DApp...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v16 or higher) first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
npm install
cd ..

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file for local development...
    (
        echo # ===========================================
        echo # LOCAL DEVELOPMENT CONFIGURATION
        echo # ===========================================
        echo # For local development, these settings work out of the box
        echo # No sensitive information needed!
        echo.
        echo # Local Hardhat network configuration
        echo HARDHAT_NETWORK_URL=http://localhost:8545
        echo HARDHAT_CHAIN_ID=1337
        echo.
        echo # Frontend configuration for local development
        echo REACT_APP_NETWORK_ID=1337
        echo REACT_APP_NETWORK_NAME=localhost
        echo.
        echo # ===========================================
        echo # TESTNET DEPLOYMENT (OPTIONAL^)
        echo # ===========================================
        echo # WARNING: Never commit your private key to version control!
        echo # Only uncomment and fill these if you want to deploy to Sepolia testnet
        echo.
        echo # Sepolia testnet configuration (OPTIONAL^)
        echo # SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
        echo # PRIVATE_KEY=your_private_key_here
        echo.
        echo # Testnet frontend configuration (OPTIONAL^)
        echo # REACT_APP_NETWORK_ID=11155111
        echo # REACT_APP_NETWORK_NAME=sepolia
    ) > .env
    echo ✅ .env file created with local development settings
    echo ℹ️  No sensitive information needed for local development!
)

REM Compile contracts
echo 🔨 Compiling smart contracts...
npm run compile

echo ✅ Setup complete!
echo.
echo 🎉 Next steps:
echo 1. Start local Hardhat network: npx hardhat node
echo 2. Deploy contracts: npm run deploy
echo 3. Start frontend: npm start
echo 4. Open http://localhost:3000 and connect MetaMask
echo.
echo 📚 For more information, see README.md
pause
