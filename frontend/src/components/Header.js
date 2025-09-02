import React from 'react';

function Header({ account, contract, activeTab, setActiveTab }) {
    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    🛒 Decentralized Marketplace
                </div>

                <div className="account-info">
                    <div className="account-address">
                        {formatAddress(account)}
                    </div>
                </div>
            </div>

            <div className="nav-tabs">
                <button
                    className={`nav-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
                    onClick={() => setActiveTab('marketplace')}
                >
                    🏪 Marketplace
                </button>
                <button
                    className={`nav-tab ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    ➕ List Item
                </button>
                <button
                    className={`nav-tab ${activeTab === 'my-items' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-items')}
                >
                    📦 My Items
                </button>
            </div>
        </header>
    );
}

export default Header;
