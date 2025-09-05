import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import Header from './components/Header';
import Marketplace from './components/Marketplace';
import ListItem from './components/ListItem';
import MyItems from './components/MyItems';
import OwnerDashboard from './components/OwnerDashboard';

function App() {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    // const [provider, setProvider] = useState(null); // Removed unused variable
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('marketplace');
    const [isOwner, setIsOwner] = useState(false);

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
                // setProvider(provider); // Removed unused setter

                // Get signer
                const signer = await provider.getSigner();

                // Load contract
                const contractAddress = require('./contracts/contract-address.json');
                const contractABI = require('./contracts/Marketplace.json').abi;

                if (contractAddress.address) {
                    const contract = new ethers.Contract(contractAddress.address, contractABI, signer);
                    setContract(contract);

                    // Check if current account is the owner
                    try {
                        const owner = await contract.owner();
                        setIsOwner(owner.toLowerCase() === accounts[0].toLowerCase());
                    } catch (error) {
                        console.error('Error checking owner:', error);
                        setIsOwner(false);
                    }
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

    // React to MetaMask account / chain changes
    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = async (accs) => {
            const next = accs?.[0] || '';
            setAccount(next);
            try {
                const nextProvider = new ethers.BrowserProvider(window.ethereum);
                // setProvider(nextProvider); // Removed unused setter
                const signer = await nextProvider.getSigner();
                const contractAddress = require('./contracts/contract-address.json');
                const contractABI = require('./contracts/Marketplace.json').abi;
                if (contractAddress.address) {
                    const newContract = new ethers.Contract(contractAddress.address, contractABI, signer);
                    setContract(newContract);

                    // Check if current account is the owner
                    try {
                        const owner = await newContract.owner();
                        setIsOwner(owner.toLowerCase() === next.toLowerCase());
                    } catch (error) {
                        console.error('Error checking owner:', error);
                        setIsOwner(false);
                    }
                } else {
                    setContract(null);
                    setIsOwner(false);
                }
            } catch (e) {
                console.error('Account change reinit failed:', e);
            }
        };

        const handleChainChanged = () => {
            window.location.reload();
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        };
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
                isOwner={isOwner}
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
                {activeTab === 'owner' && isOwner && (
                    <OwnerDashboard contract={contract} account={account} />
                )}
            </main>
        </div>
    );
}

export default App;
