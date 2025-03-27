import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchResults.css';
import ProductsGrid from '../../components/ProductsGrid/ProductsGrid';
import API from '../../api';

const SearchResults = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cart, setCart] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    const searchQuery = new URLSearchParams(location.search).get('q');

    const fetchSearchResults = async () => {
        setLoading(true);
        try {
            // 1. First fetch products from your backend
            const response = await API.get(
                `/api/products/search?q=${searchQuery}`
            );

            // 2. Enhance products with Unsplash images
            const productsWithImages = await Promise.all(
                response.data.map(async (product) => {
                    try {
                        const unsplashResponse = await axios.get(
                            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(product.product_name)}&client_id=${ACCESS_KEY}&per_page=1`
                        );

                        return {
                            ...product,
                            image: unsplashResponse.data.results[0]?.urls?.small ||
                                `https://source.unsplash.com/random/300x200/?${encodeURIComponent(product.product_name)},grocery`,
                            rating: (Math.random() * 2 + 3).toFixed(1) // Random rating between 3.0-5.0
                        };
                    } catch (unsplashError) {
                        console.error(`Error fetching image for ${product.product_name}:`, unsplashError);
                        return {
                            ...product,
                            image: `https://source.unsplash.com/random/300x200/?${encodeURIComponent(product.product_name)},grocery`,
                            rating: (Math.random() * 2 + 3).toFixed(1)
                        };
                    }
                })
            );

            setProducts(productsWithImages);
            setError('');
        } catch (err) {
            setError('Failed to fetch search results');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
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
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="search-results-container">
            <h2 className="search-results-title">Search Results for "{searchQuery}"</h2>

            <ProductsGrid
                products={products}
                isInCart={isInCart}
                handleAdd={handleAdd}
                handleRemove={handleRemove}
                loading={loading}
            />

            {products.length === 0 && (
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