import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

function OwnerDashboard({ contract, account }) {
    const [pendingPurchases, setPendingPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const loadPendingPurchases = useCallback(async () => {
        if (!contract) return;

        try {
            setLoading(true);
            const purchases = await contract.getAllPendingPurchases();
            setPendingPurchases(purchases);
        } catch (error) {
            console.error('Error loading pending purchases:', error);
            setMessage('Failed to load pending purchases');
        } finally {
            setLoading(false);
        }
    }, [contract]);

    const approvePurchase = async (pendingPurchaseId) => {
        if (!contract) {
            setMessage('Contract not loaded. Please refresh and try again.');
            return;
        }
        if (typeof contract.approvePurchase !== 'function') {
            setMessage('Approve function not available on contract.');
            return;
        }
        try {
            setLoading(true);
            setMessage('Approving purchase...');
            if (!contract.approvePurchase) {
                throw new Error('approvePurchase function not found on contract');
            }
            const tx = await contract.approvePurchase(pendingPurchaseId);
            if (!tx) {
                throw new Error('No transaction returned from approvePurchase');
            }
            await tx.wait();
            setMessage('Purchase approved successfully!');
            // Remove the approved purchase from the UI immediately
            setPendingPurchases(prev => prev.filter((_, idx) => idx !== (pendingPurchaseId - 1)));
        } catch (error) {
            console.error('Error approving purchase:', error);
            setMessage(`Failed to approve purchase: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const rejectPurchase = async (pendingPurchaseId) => {
        if (!contract) {
            setMessage('Contract not loaded. Please refresh and try again.');
            return;
        }
        if (typeof contract.rejectPurchase !== 'function') {
            setMessage('Reject function not available on contract.');
            return;
        }
        try {
            setLoading(true);
            setMessage('Rejecting purchase...');
            if (!contract.rejectPurchase) {
                throw new Error('rejectPurchase function not found on contract');
            }
            const tx = await contract.rejectPurchase(pendingPurchaseId);
            if (!tx) {
                throw new Error('No transaction returned from rejectPurchase');
            }
            await tx.wait();
            setMessage('Purchase rejected successfully!');
            // Remove the rejected purchase from the UI immediately
            setPendingPurchases(prev => prev.filter((_, idx) => idx !== (pendingPurchaseId - 1)));
        } catch (error) {
            console.error('Error rejecting purchase:', error);
            setMessage(`Failed to reject purchase: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatTimestamp = (timestamp) => {
        return new Date(Number(timestamp) * 1000).toLocaleString();
    };

    useEffect(() => {
        loadPendingPurchases();
    }, [loadPendingPurchases]);

    return (
        <div className="owner-dashboard">
            <div className="dashboard-header">
                <h2>🏛️ Owner Dashboard</h2>
                <p>Manage pending purchase requests</p>
                <button
                    className="refresh-btn"
                    onClick={loadPendingPurchases}
                    disabled={loading}
                >
                    🔄 Refresh
                </button>
            </div>

            {message && (
                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            {loading && <div className="loading">Loading...</div>}

            <div className="pending-purchases">
                <h3>📋 Pending Purchases ({pendingPurchases.length})</h3>

                {pendingPurchases.length === 0 ? (
                    <div className="no-pending">
                        <p>No pending purchases at the moment</p>
                    </div>
                ) : (
                    <div className="purchases-grid">
                        {pendingPurchases.map((purchase, index) => (
                            <div key={index} className="purchase-card">
                                <div className="purchase-header">
                                    <h4>Purchase Request #{index + 1}</h4>
                                    <span className="timestamp">
                                        {formatTimestamp(purchase.timestamp)}
                                    </span>
                                </div>

                                <div className="purchase-details">
                                    <div className="detail-row">
                                        <span className="label">Item ID:</span>
                                        <span className="value">#{purchase.itemId}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Price:</span>
                                        <span className="value price">
                                            {ethers.formatEther(purchase.price)} ETH
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Buyer:</span>
                                        <span className="value address">
                                            {formatAddress(purchase.buyer)}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Seller:</span>
                                        <span className="value address">
                                            {formatAddress(purchase.seller)}
                                        </span>
                                    </div>
                                </div>

                                <div className="purchase-actions">
                                    <button
                                        className="approve-btn"
                                        onClick={() => approvePurchase(index + 1)}
                                        disabled={loading}
                                    >
                                        ✅ Approve
                                    </button>
                                    <button
                                        className="reject-btn"
                                        onClick={() => rejectPurchase(index + 1)}
                                        disabled={loading}
                                    >
                                        ❌ Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OwnerDashboard;
