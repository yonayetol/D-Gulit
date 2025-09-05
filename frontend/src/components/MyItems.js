import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

function MyItems({ contract, account }) {
    const [listedItems, setListedItems] = useState([]);
    const [purchasedItems, setPurchasedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('listed');
    const [error, setError] = useState('');

    const loadMyItems = useCallback(async () => {
        try {
            setLoading(true);
            let formattedListed = [];
            let formattedPurchased = [];
            if (contract) {
                try {
                    const listed = await contract.getMyListedItems();
                    // Fetch metadata for each item from server if imageUrl is a metadata URL
                    formattedListed = await Promise.all(listed.map(async item => {
                        let meta = {};
                        if (item.imageUrl && item.imageUrl.startsWith('http')) {
                            try {
                                const resp = await fetch(item.imageUrl);
                                if (resp.ok) {
                                    meta = await resp.json();
                                }
                            } catch (e) {
                                // fallback to contract data
                            }
                        }
                        return {
                            id: item.id.toString(),
                            name: meta.name || item.name,
                            description: meta.description || item.description,
                            imageUrl: meta.imageUrl || item.imageUrl,
                            price: ethers.formatEther(item.price),
                            seller: item.seller,
                            buyer: item.buyer,
                            isSold: item.isSold
                        };
                    }));
                } catch (e) {
                    console.warn('Chain listed items failed');
                }
                try {
                    const purchased = await contract.getMyPurchasedItems();
                    formattedPurchased = await Promise.all(purchased.map(async item => {
                        let meta = {};
                        if (item.imageUrl && item.imageUrl.startsWith('http')) {
                            try {
                                const resp = await fetch(item.imageUrl);
                                if (resp.ok) {
                                    meta = await resp.json();
                                }
                            } catch (e) {}
                        }
                        return {
                            id: item.id.toString(),
                            name: meta.name || item.name,
                            description: meta.description || item.description,
                            imageUrl: meta.imageUrl || item.imageUrl,
                            price: ethers.formatEther(item.price),
                            seller: item.seller,
                            buyer: item.buyer,
                            isSold: item.isSold
                        };
                    }));
                } catch (e) {
                    console.warn('Chain purchased items failed');
                }
            }
            setListedItems(formattedListed);
            setPurchasedItems(formattedPurchased);
            setError('');
        } catch (err) {
            console.error('Error loading items:', err);
            setError('Failed to load items. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [contract, account]);

    useEffect(() => {
        loadMyItems();
    }, [loadMyItems]);

    const renderItemCard = (item, isPurchased = false) => (
        <div key={item.id} className="item-card">
            <div className="item-image-container">
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="item-image"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                />
            </div>
            <h3 className="item-name">{item.name}</h3>
            <p className="item-description">{item.description}</p>
            <div className="item-price">{item.price} ETH</div>

            {isPurchased ? (
                <div className="item-seller">
                    Purchased from: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}
                </div>
            ) : (
                <div className="item-seller">
                    {item.isSold ? (
                        <>
                            Sold to: {item.buyer.slice(0, 6)}...{item.buyer.slice(-4)}
                        </>
                    ) : (
                        'Available for purchase'
                    )}
                </div>
            )}

            {isPurchased ? (
                <div className="sold-badge" style={{ background: '#27ae60' }}>
                    ✅ PURCHASED
                </div>
            ) : item.isSold ? (
                <div className="sold-badge">
                    SOLD
                </div>
            ) : (
                <div className="sold-badge" style={{ background: '#f39c12' }}>
                    FOR SALE
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="loading">
                <h2>Loading your items...</h2>
            </div>
        );
    }

    return (
        <div>
            <h1 className="section-title">📦 My Items</h1>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="nav-tabs" style={{ marginBottom: '2rem', justifyContent: 'center' }}>
                <button
                    className={`nav-tab ${activeTab === 'listed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('listed')}
                >
                    📝 My Listings ({listedItems.length})
                </button>
                <button
                    className={`nav-tab ${activeTab === 'purchased' ? 'active' : ''}`}
                    onClick={() => setActiveTab('purchased')}
                >
                    🛒 My Purchases ({purchasedItems.length})
                </button>
                <button
                    className="nav-tab"
                    onClick={loadMyItems}
                    title="Refresh items"
                >
                    🔄 Refresh
                </button>
            </div>

            {activeTab === 'listed' && (
                <div>
                    <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Items You've Listed</h2>
                    {listedItems.length === 0 ? (
                        <div className="empty-state">
                            <h3>No items listed yet</h3>
                            <p>Start by listing your first item for sale!</p>
                        </div>
                    ) : (
                        <div className="items-grid">
                            {listedItems.map(item => renderItemCard(item, false))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'purchased' && (
                <div>
                    <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Items You've Purchased</h2>
                    {purchasedItems.length === 0 ? (
                        <div className="empty-state">
                            <h3>No purchases yet</h3>
                            <p>Browse the marketplace to find items you'd like to buy!</p>
                        </div>
                    ) : (
                        <div className="items-grid">
                            {purchasedItems.map(item => renderItemCard(item, true))}
                        </div>
                    )}
                </div>
            )}

            {/* Info panel removed per request */}
        </div>
    );
}

export default MyItems;
