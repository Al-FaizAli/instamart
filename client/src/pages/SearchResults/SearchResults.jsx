import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchResults.css';
import ProductsGrid from '../../components/ProductsGrid/ProductsGrid';

const SearchResults = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cart, setCart] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    const FLASK_API_URL = 'https://render-search-nlp.onrender.com';

    const searchQuery = new URLSearchParams(location.search).get('q');

    const parseHtmlResponse = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const resultsScript = doc.querySelector('script[id="search-results"]');

        if (!resultsScript) {
            throw new Error('No search results found in response');
        }

        try {
            return JSON.parse(resultsScript.textContent);
        } catch (e) {
            throw new Error('Failed to parse search results');
        }
    };

    const fetchSearchResults = async () => {
        setLoading(true);
        try {
            // 1. Fetch from Flask API
            const searchResponse = await axios.get(
                `${FLASK_API_URL}/search?query=${encodeURIComponent(searchQuery)}`,
                { headers: { 'Accept': 'application/json' } }
            );

            // Parse response data
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

            // 2. Get full product details from MongoDB
            const detailsResponse = await axios.get(
                `http://localhost:5000/api/products/by-ids?ids=${productIds.join(',')}`
            );

            // 3. Enhance with images
            const productsWithImages = await Promise.all(
                detailsResponse.data.map(async (product) => {
                    try {
                        const imageUrl = await fetchProductImage(product.product_name);
                        return {
                            ...product,
                            image: imageUrl,
                            rating: (Math.random() * 2 + 3).toFixed(1)
                        };
                    } catch (err) {
                        console.error(`Image error for ${product.product_name}:`, err);
                        return {
                            ...product,
                            image: `https://source.unsplash.com/random/300x200/?grocery`,
                            rating: (Math.random() * 2 + 3).toFixed(1)
                        };
                    }
                })
            );

            setProducts(productsWithImages);
        } catch (err) {
            console.error('Search error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to fetch search results');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductImage = async (productName) => {
        try {
            const response = await axios.get('https://api.unsplash.com/search/photos', {
                params: {
                    query: productName,
                    per_page: 1,
                    client_id: ACCESS_KEY
                }
            });
            return response.data.results[0]?.urls?.small;
        } catch (err) {
            console.error('Unsplash error:', err);
            return `https://source.unsplash.com/random/300x200/?${encodeURIComponent(productName)}`;
        }
    };

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://localhost:5000/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCart(response.data.cart?.items || []);
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

            await axios.post('http://localhost:5000/api/cart/add',
                {
                    productId: product.product_id,
                    name: product.product_name,
                    price: product.price || 10.99,
                    image: product.image,
                    quantity: 1
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            await fetchCart();
            alert(`${product.product_name} added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(error.response?.data?.error || 'Failed to add to cart');
        }
    };

    const handleRemove = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to modify cart');
                return;
            }

            await axios.delete(`http://localhost:5000/api/cart/remove/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            await fetchCart();
            alert('Item removed from cart');
        } catch (error) {
            console.error('Error removing from cart:', error);
            alert(error.response?.data?.error || 'Failed to remove from cart');
        }
    };

    const isInCart = (productId) => {
        return cart.some(item => item.product.productId === productId);
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