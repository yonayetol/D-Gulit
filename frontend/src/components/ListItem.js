import React, { useState } from 'react';
import { ethers } from 'ethers';

function ListItem({ contract, account }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',

        price: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [file, setFile] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!contract) {
            setError('Contract not loaded. Please try again.');
            return;
        }

        // Validate form
        if (!formData.name.trim()) {
            setError('Please enter an item name.');
            return;
        }

        if (!formData.description.trim()) {
            setError('Please enter an item description.');
            return;
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            setError('Please enter a valid price greater than 0.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const priceInWei = ethers.parseEther(formData.price);

            // 1. Upload image if provided
            let imageUrl = '';
            if (file) {
                try {
                    const form = new FormData();
                    form.append('file', file);
                    const resp = await fetch('http://localhost:4000/upload-post', {
                        method: 'POST',
                        body: form
                    });
                    if (resp.ok) {
                        const data = await resp.json();
                        imageUrl = data.url || '';
                    } else {
                        console.warn('Local upload failed with status', resp.status);
                    }
                } catch (e) {
                    console.warn('Local upload unreachable, proceeding without image');
                    imageUrl = '';
                }
            }

            // 2. Upload metadata JSON to server and get metadata URL
            let metadataUrl = '';
            try {
                const metaResp = await fetch('http://localhost:4000/upload-metadata', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        description: formData.description.trim(),
                        imageUrl: imageUrl,
                        price: formData.price,
                        seller: account || ''
                    })
                });
                if (metaResp.ok) {
                    const metaData = await metaResp.json();
                    metadataUrl = metaData.url || '';
                } else {
                    setError('Failed to upload metadata.');
                    setLoading(false);
                    return;
                }
            } catch (e) {
                setError('Failed to upload metadata.');
                setLoading(false);
                return;
            }

            // 3. Store only the metadata URL in the contract
            const tx = await contract.listItem(
                formData.name.trim(),
                formData.description.trim(),
                metadataUrl,
                priceInWei
            );
            await tx.wait();

            setSuccess('Item listed successfully!');
            setFormData({ name: '', description: '', price: '' });
            setFile(null);
        } catch (err) {
            console.error('Error listing item:', err);
            const msg = (err && err.message) ? err.message : 'Unknown error';
            if (msg.toLowerCase().includes('user rejected')) {
                setError('Transaction was cancelled.');
            } else {
                setError(`Failed to list item: ${msg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="section-title">➕ List New Item</h1>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Item Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="e.g., Premium Study Notes, Exclusive Wallpaper"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" className="form-label">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="form-textarea"
                            placeholder="Describe your item in detail. What makes it special? What will buyers get?"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Image (optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                            className="form-input"
                        />
                        <small style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem', display: 'block' }}>
                            If selected, the image will be stored locally by the upload server and displayed in the marketplace.
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="price" className="form-label">
                            Price (ETH) *
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="0.1"
                            step="0.001"
                            min="0.001"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Listing Item...
                            </>
                        ) : (
                            'List Item for Sale'
                        )}
                    </button>
                </form>
            </div>

            <div className="tips-panel">
                <h3 className="tips-title">💡 Tips for Successful Listings</h3>
                <ul className="tips-list">
                    <li><strong>Be descriptive:</strong> Explain what makes your item unique and valuable</li>
                    <li><strong>Set fair prices:</strong> Research similar items and price competitively</li>
                    <li><strong>Highlight exclusivity:</strong> Mention if it's limited edition or one-of-a-kind</li>
                    <li><strong>Examples:</strong> Study materials, digital art, exclusive content, access codes</li>
                </ul>
            </div>
        </div>
    );
}

export default ListItem;
