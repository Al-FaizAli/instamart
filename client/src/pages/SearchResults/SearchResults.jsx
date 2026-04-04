import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchResults.css';
import ProductsGrid from '../../components/ProductsGrid/ProductsGrid';
import API from '../../api';
import { normalizeProducts } from '../../utils/productHelpers';

const SearchResults = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cart, setCart] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const FLASK_API_URL = 'https://render-search-nlp.onrender.com';


    const searchQuery = new URLSearchParams(location.search).get('q');

    const fetchSearchResults = async () => {
        setLoading(true);
        try {
            const searchResponse = await axios.get(
                `${FLASK_API_URL}/search?query=${encodeURIComponent(searchQuery)}`,
                { headers: { 'Accept': 'application/json' } }
            );

            let productData = [];
            if (Array.isArray(searchResponse.data)) {
                productData = searchResponse.data;
            } else if (searchResponse.data.results) {
                productData = searchResponse.data.results;
            } else {
                throw new Error('Unexpected API response format');
            }

            // Extract and validate product IDs
            const productIds = productData
                .map(product => product.product_id)
                .filter(id => !isNaN(parseInt(id)));

            if (productIds.length === 0) {
                setProducts([]);
                return;
            }

            const detailsResponse = await API.get(
                `/api/products/by-ids?ids=${productIds.join(',')}`
            );

            setProducts(normalizeProducts(detailsResponse.data));
        } catch (err) {
            console.error('Search error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to fetch search results');
        } finally {
            setLoading(false);
        }
    };

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await API.get('/api/cart');
            setCart(response.data.cart || []);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    useEffect(() => {
        if (searchQuery) {
            fetchSearchResults();
            fetchCart();
        } else {
            navigate('/');
        }
    }, [searchQuery, navigate]);

    const handleAdd = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to add items to cart');
                return;
            }

            const product = products.find(p => p.product_id === productId);
            if (!product) return;

            await API.post('/api/cart/add',
                {
                    product_id: product.product_id,
                    quantity: 1
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            await fetchCart();
            alert(`${product.product_name} added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    const handleRemove = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to modify cart');
                return;
            }

            await API.delete(`/api/cart/${productId}`);

            await fetchCart();
            alert('Item removed from cart');
        } catch (error) {
            console.error('Error removing from cart:', error);
            alert(error.response?.data?.message || 'Failed to remove from cart');
        }
    };

    const isInCart = (productId) => {
        return cart.some(item => item.product_id === productId);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Searching for "{searchQuery}"...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button
                    onClick={() => navigate('/')}
                    className="continue-shopping-btn"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="search-results-container">
            <h2 className="search-results-title">Search Results for "{searchQuery}"</h2>

            {error ? (
                <div className="error-message">
                    {error}
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        Retry
                    </button>
                </div>
            ) : (
                <ProductsGrid
                    products={products}
                    isInCart={isInCart}
                    handleAdd={handleAdd}
                    handleRemove={handleRemove}
                    loading={loading}
                />
            )}

            {products.length === 0 && !loading && !error && (
                <div className="no-results">
                    <p>No products found for "{searchQuery}"</p>
                    <button
                        onClick={() => navigate('/')}
                        className="continue-shopping-btn"
                    >
                        Continue Shopping
                    </button>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
