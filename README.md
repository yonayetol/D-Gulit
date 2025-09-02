# Decentralized Marketplace DApp

A decentralized marketplace built on Ethereum where users can list and purchase digital items using ETH. This project demonstrates smart contract development, Web3 integration, and decentralized commerce concepts.

## Features

- **Smart Contract**: Secure marketplace contract with listing and purchasing functionality
- **Frontend**: React-based UI with MetaMask integration
- **Wallet Integration**: Connect with MetaMask to interact with the marketplace
- **Item Management**: List items for sale, browse marketplace, and purchase items
- **Ownership Tracking**: On-chain ownership records for all transactions

## Project Structure

```
├── contracts/           # Solidity smart contracts
│   └── Marketplace.sol
├── scripts/            # Deployment scripts
│   └── deploy.js
├── test/               # Smart contract tests
│   └── Marketplace.test.js
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── contracts/
│   │   └── App.js
│   └── package.json
├── hardhat.config.js   # Hardhat configuration
└── package.json        # Root package.json
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd decentralized-marketplace
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   npm run install:frontend
   ```

3. **Environment setup (Automatic)**
   ```bash
   # The setup script automatically creates a .env file with local development settings
   # No manual configuration needed for local development!
   # 
   # The .env file contains safe local settings:
   # - HARDHAT_NETWORK_URL=http://localhost:8545
   # - HARDHAT_CHAIN_ID=1337
   # - REACT_APP_NETWORK_ID=1337
   # - REACT_APP_NETWORK_NAME=localhost
   ```

## Development

### 🚀 Quick Start (Local Development)

**For the easiest setup, see [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for a complete guide.**

Quick commands:
```bash
# 1. Setup everything
npm run install:all

# 2. Start local blockchain
npx hardhat node

# 3. Deploy contracts (in new terminal)
npm run deploy

# 4. Start frontend (in new terminal)
npm start
```

### Smart Contract Development

1. **Compile contracts**
   ```bash
   npm run compile
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Deploy to local network**
   ```bash
   # Start local Hardhat network
   npx hardhat node
   
   # In another terminal, deploy contracts
   npm run deploy
   ```

4. **Deploy to Sepolia testnet** (Optional)
   ```bash
   npm run deploy:sepolia
   ```

### Frontend Development

1. **Start the development server**
   ```bash
   npm start
   ```

2. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Make sure MetaMask is installed and connected to localhost:8545

## Usage

### For Sellers

1. **Connect your wallet** using MetaMask
2. **Navigate to "List Item"** tab
3. **Fill out the form**:
   - Item name (e.g., "Premium Study Notes")
   - Description (detailed explanation of what buyers get)
   - Price in ETH
4. **Submit the transaction** and wait for confirmation
5. **Your item is now listed** on the marketplace

### For Buyers

1. **Browse the marketplace** to see available items
2. **Click "Buy"** on any item you want to purchase
3. **Confirm the transaction** in MetaMask
4. **Wait for confirmation** - you now own the item!
5. **View your purchases** in the "My Items" tab

## Smart Contract Details

### Key Functions

- `listItem(name, description, price)`: List a new item for sale
- `purchaseItem(itemId)`: Purchase an item by paying ETH
- `getAvailableItems()`: Get all items available for purchase
- `getMyListedItems()`: Get items listed by the current user
- `getMyPurchasedItems()`: Get items purchased by the current user

### Events

- `ItemListed`: Emitted when a new item is listed
- `ItemPurchased`: Emitted when an item is purchased

### Security Features

- Price validation (must be > 0)
- Seller cannot buy their own items
- Automatic ETH transfer to seller
- Excess payment refund
- Ownership transfer tracking

## Testing

The project includes comprehensive tests for the smart contract:

```bash
npm test
```

Tests cover:
- Contract deployment
- Item listing functionality
- Purchase functionality
- Error handling
- View functions

## Deployment

### Local Development (No .env needed!)

1. Start Hardhat network: `npx hardhat node`
2. Deploy contracts: `npm run deploy`
3. Start frontend: `npm start`

**That's it!** No environment variables needed for local development.

### Testnet Deployment

1. Configure `.env` with your Infura URL and private key
2. Deploy to Sepolia: `npm run deploy:sepolia`
3. Update frontend with deployed contract address
4. Build and deploy frontend: `npm run build`

## Example Items

Here are some examples of digital items you can list:

- **Study Materials**: Premium notes, exam guides, course materials
- **Digital Art**: Exclusive wallpapers, digital paintings, NFTs
- **Content Access**: Private group access, premium content links
- **Software**: License keys, premium app access
- **Services**: Consultation slots, tutoring sessions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues:

1. Check that MetaMask is installed and connected
2. Ensure you're on the correct network (localhost:8545 for development)
3. Make sure you have sufficient ETH for transactions
4. Check the browser console for error messages

## Future Enhancements

- ERC-20 token support
- NFT integration
- Auction functionality
- Rating and review system
- File upload and storage
- Multi-signature escrow
- Dispute resolution mechanism
