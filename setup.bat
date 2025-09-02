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
    echo 📝 Creating .env file...
    copy env.example .env
    echo ⚠️  Please edit .env file with your configuration
)

REM Compile contracts
echo 🔨 Compiling smart contracts...
npm run compile

echo ✅ Setup complete!
echo.
echo 🎉 Next steps:
echo 1. Edit .env file with your configuration (optional for local development)
echo 2. Start local Hardhat network: npx hardhat node
echo 3. Deploy contracts: npm run deploy
echo 4. Start frontend: npm start
echo.
echo 📚 For more information, see README.md
pause
