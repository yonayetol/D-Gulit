import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function Marketplace({ contract, account }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadItems = async () => {
        if (!contract) return;

        try {
            setLoading(true);
            const availableItems = await contract.getAvailableItems();

            const formattedItems = availableItems.map(item => ({
                id: item.id.toString(),
                name: item.name,
                description: item.description,
                price: ethers.formatEther(item.price),
                seller: item.seller,
                buyer: item.buyer,
                isSold: item.isSold
            }));

            setItems(formattedItems);
            setError('');
        } catch (err) {
            console.error('Error loading items:', err);
            setError('Failed to load items. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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

            alert('Item purchased successfully!');
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
    }, [contract]);

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
                            <h3 className="item-name">{item.name}</h3>
                            <p className="item-description">{item.description}</p>
                            <div className="item-price">{item.price} ETH</div>
                            <div className="item-seller">
                                Seller: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}
                            </div>

                            {item.isSold ? (
                                <div className="sold-badge">SOLD</div>
                            ) : (
                                <div className="item-actions">
                                    <button
                                        className="buy-button"
                                        onClick={() => purchaseItem(item.id, item.price)}
                                        disabled={loading || item.seller.toLowerCase() === account.toLowerCase()}
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
