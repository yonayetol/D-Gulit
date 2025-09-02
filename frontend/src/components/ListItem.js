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

            // If a local file is provided, upload to local upload server
            let finalImageUrl = '';
            if (file) {
                try {
                    const form = new FormData();
                    form.append('file', file);
                    const resp = await fetch('http://localhost:4000/upload', {
                        method: 'POST',
                        body: form
                    });
                    if (!resp.ok) {
                        console.warn('Local upload failed with status', resp.status);
                    } else {
                        const data = await resp.json();
                        finalImageUrl = data.url || '';
                    }
                } catch (e) {
                    console.warn('Local upload unreachable, proceeding without image');
                    finalImageUrl = '';
                }
            }

            const tx = await contract.listItem(
                formData.name.trim(),
                formData.description.trim(),
                finalImageUrl,
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

            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>💡 Tips for Successful Listings:</h3>
                <ul style={{ color: '#666', lineHeight: '1.6' }}>
                    <li><strong>Be descriptive:</strong> Explain what makes your item unique and valuable</li>
                    <li><strong>Set fair prices:</strong> Research similar items and price competitively</li>
                    <li><strong>Highlight exclusivity:</strong> Mention if it's limited edition or one-of-a-kind</li>
                    <li><strong>Examples of popular items:</strong> Study materials, digital art, exclusive content, access codes</li>
                </ul>
            </div>
        </div>
    );
}

export default ListItem;
