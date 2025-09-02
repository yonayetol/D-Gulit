import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import Header from './components/Header';
import Marketplace from './components/Marketplace';
import ListItem from './components/ListItem';
import MyItems from './components/MyItems';

function App() {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('marketplace');

    const loadBlockchainData = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });

                setAccount(accounts[0]);

                // Get provider
                const provider = new ethers.BrowserProvider(window.ethereum);
                setProvider(provider);

                // Get signer
                const signer = await provider.getSigner();

                // Load contract
                const contractAddress = require('./contracts/contract-address.json');
                const contractABI = require('./contracts/Marketplace.json').abi;

                if (contractAddress.address) {
                    const contract = new ethers.Contract(contractAddress.address, contractABI, signer);
                    setContract(contract);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error loading blockchain data:', error);
                setLoading(false);
            }
        } else {
            alert('Please install MetaMask to use this application!');
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBlockchainData();
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <h2>Loading...</h2>
                <p>Please make sure MetaMask is installed and connected.</p>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="no-account">
                <h2>Welcome to Decentralized Marketplace</h2>
                <p>Please connect your MetaMask wallet to continue.</p>
                <button onClick={loadBlockchainData} className="connect-button">
                    Connect Wallet
                </button>
            </div>
        );
    }

    return (
        <div className="App">
            <Header
                account={account}
                contract={contract}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <main className="main-content">
                {activeTab === 'marketplace' && (
                    <Marketplace contract={contract} account={account} />
                )}
                {activeTab === 'list' && (
                    <ListItem contract={contract} account={account} />
                )}
                {activeTab === 'my-items' && (
                    <MyItems contract={contract} account={account} />
                )}
            </main>
        </div>
    );
}

export default App;
