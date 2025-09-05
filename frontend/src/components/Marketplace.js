import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

function Marketplace({ contract, account }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // const [pendingPurchases, setPendingPurchases] = useState([]); // Removed unused variable

    const loadItems = useCallback(async () => {
        try {
            setLoading(true);
            if (!contract) {
                setItems([]);
                // setPendingPurchases([]); // Removed unused setter
                return;
            }

            // Load available items
            const availableItems = await contract.getAvailableItems();

            // Load pending purchases
            const pending = await contract.getAllPendingPurchases();
            // setPendingPurchases(pending); // Removed unused setter

            const chainItems = availableItems.map(item => {
                // Check if this item has pending purchases
                const hasPendingPurchase = pending.some(p => p.itemId.toString() === item.id.toString());

                return {
                    id: item.id.toString(),
                    name: item.name,
                    description: item.description,
                    imageUrl: item.imageUrl,
                    price: ethers.formatEther(item.price),
                    seller: item.seller,
                    buyer: item.buyer,
                    isSold: item.isSold,
                    hasPendingPurchase: hasPendingPurchase,
                    source: 'chain'
                };
            });
            setItems(chainItems);
            setError('');
        } catch (err) {
            console.error('Error loading on-chain items:', err);
            setError('Failed to load items. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [contract]);

    const purchaseItem = async (itemId, price) => {
        if (!contract) return;

        try {
            setLoading(true);
            const tx = await contract.purchaseItem(itemId, {
                value: ethers.parseEther(price)
            });

            await tx.wait();

            // Reload items after purchase
            await loadItems();
        } catch (err) {
            console.error('Error purchasing item:', err);
            if (err.message.includes('insufficient funds')) {
                alert('Insufficient funds to purchase this item.');
            } else if (err.message.includes('user rejected')) {
                alert('Transaction was cancelled.');
            } else {
                alert('Failed to purchase item. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    if (loading && items.length === 0) {
        return (
            <div className="loading">
                <h2>Loading marketplace...</h2>
            </div>
        );
    }

    return (
        <div>
            <h1 className="section-title">🛒 Marketplace</h1>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {items.length === 0 ? (
                <div className="empty-state">
                    <h3>No items available</h3>
                    <p>Be the first to list an item for sale!</p>
                </div>
            ) : (
                <div className="items-grid">
                    {items.map((item) => (
                        <div key={item.id} className="item-card">
                            {item.imageUrl ? (
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
                            ) : null}
                            <h3 className="item-name">{item.name}</h3>
                            <p className="item-description">{item.description}</p>
                            <div className="item-price">{item.price} ETH</div>
                            <div className="item-seller">
                                Seller: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}
                            </div>
                            {/* Only allow buying for on-chain items */}
                            {item.source !== 'chain' ? (
                                item.isSold ? (
                                    <div className="sold-badge">SOLD</div>
                                ) : (item.seller && account && item.seller.toLowerCase() === account.toLowerCase()) ? (
                                    <div className="sold-badge" style={{ background: '#f39c12' }}>WAITING FOR BUYER</div>
                                ) : (
                                    <div className="sold-badge" style={{ background: '#f39c12' }}>LOCAL LISTING</div>
                                )
                            ) : item.isSold ? (
                                <div className="sold-badge">SOLD</div>
                            ) : item.hasPendingPurchase ? (
                                <div className="sold-badge" style={{ background: '#e74c3c' }}>WAITING FOR APPROVAL</div>
                            ) : (
                                <div className="item-actions">
                                    <button
                                        className="buy-button"
                                        onClick={() => purchaseItem(item.id, item.price)}
                                        disabled={
                                            loading ||
                                            !item.price ||
                                            item.seller.toLowerCase() === account.toLowerCase()
                                        }
                                    >
                                        {loading ? (
                                            <>
                                                <span className="loading-spinner"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            `Buy for ${item.price} ETH`
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Marketplace;
