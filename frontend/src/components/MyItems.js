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

            // On-chain listed items
            let formattedListed = [];
            let formattedPurchased = [];
            if (contract) {
                try {
                    const listed = await contract.getMyListedItems();
                    formattedListed = listed.map(item => ({
                        id: item.id.toString(),
                        name: item.name,
                        description: item.description,
                        imageUrl: item.imageUrl,
                        price: ethers.formatEther(item.price),
                        seller: item.seller,
                        buyer: item.buyer,
                        isSold: item.isSold
                    }));
                } catch (e) {
                    console.warn('Chain listed items failed');
                }
                try {
                    const purchased = await contract.getMyPurchasedItems();
                    formattedPurchased = purchased.map(item => ({
                        id: item.id.toString(),
                        name: item.name,
                        description: item.description,
                        imageUrl: item.imageUrl,
                        price: ethers.formatEther(item.price),
                        seller: item.seller,
                        buyer: item.buyer,
                        isSold: item.isSold
                    }));
                } catch (e) {
                    console.warn('Chain purchased items failed');
                }
            }

            // Merge local posts created by this account (fallback)
            try {
                const resp = await fetch('http://localhost:4000/posts');
                if (resp.ok) {
                    const localPosts = await resp.json();
                    const mine = (localPosts || []).filter(p => (p.seller || '').toLowerCase() === (account || '').toLowerCase());
                    const mapped = mine.map(p => ({
                        id: `local-${p.id}`,
                        name: p.name,
                        description: p.description,
                        imageUrl: p.imageUrl || '',
                        price: p.price || '',
                        seller: p.seller || 'local',
                        buyer: '',
                        isSold: false
                    }));
                    formattedListed = [...mapped, ...formattedListed];
                }
            } catch (e) {
                console.warn('Local posts fetch failed');
            }

            // Also consider posts.txt (just in case JSON store fails)
            try {
                const respTxt = await fetch('http://localhost:4000/posts-txt');
                if (respTxt.ok) {
                    const txtPosts = await respTxt.json();
                    const mineTxt = (txtPosts || []).filter(p => (p.seller || '').toLowerCase() === (account || '').toLowerCase());
                    const mappedTxt = mineTxt.map(p => ({
                        id: `local-txt-${p.id}`,
                        name: p.name,
                        description: p.description,
                        imageUrl: p.imageUrl && p.imageUrl.toLowerCase() !== 'none' ? p.imageUrl : '',
                        price: p.price || '',
                        seller: p.seller || 'local',
                        buyer: '',
                        isSold: false
                    }));
                    formattedListed = [...mappedTxt, ...formattedListed];
                }
            } catch (e) {
                console.warn('posts.txt fetch failed');
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
