import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function MyItems({ contract, account }) {
    const [listedItems, setListedItems] = useState([]);
    const [purchasedItems, setPurchasedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('listed');
    const [error, setError] = useState('');

    const loadMyItems = async () => {
        if (!contract) return;

        try {
            setLoading(true);

            // Load listed items
            const listed = await contract.getMyListedItems();
            const formattedListed = listed.map(item => ({
                id: item.id.toString(),
                name: item.name,
                description: item.description,
                price: ethers.formatEther(item.price),
                seller: item.seller,
                buyer: item.buyer,
                isSold: item.isSold
            }));
            setListedItems(formattedListed);

            // Load purchased items
            const purchased = await contract.getMyPurchasedItems();
            const formattedPurchased = purchased.map(item => ({
                id: item.id.toString(),
                name: item.name,
                description: item.description,
                price: ethers.formatEther(item.price),
                seller: item.seller,
                buyer: item.buyer,
                isSold: item.isSold
            }));
            setPurchasedItems(formattedPurchased);

            setError('');
        } catch (err) {
            console.error('Error loading items:', err);
            setError('Failed to load items. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMyItems();
    }, [contract]);

    const renderItemCard = (item, isPurchased = false) => (
        <div key={item.id} className="item-card">
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

            <div style={{ marginTop: '2rem', padding: '1rem', background: '#e8f4fd', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>ℹ️ About Your Items</h3>
                <ul style={{ color: '#666', lineHeight: '1.6' }}>
                    <li><strong>Listed Items:</strong> Items you've put up for sale. You'll receive ETH when someone buys them.</li>
                    <li><strong>Purchased Items:</strong> Items you've bought from other sellers. You now own these items!</li>
                    <li><strong>Ownership:</strong> All transactions are recorded on the blockchain for transparency and security.</li>
                </ul>
            </div>
        </div>
    );
}

export default MyItems;
