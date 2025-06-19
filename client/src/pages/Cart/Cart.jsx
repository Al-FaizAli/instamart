import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Cart.css';
import API from '../../api';

const MyCart = () => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, logout, verifySession } = useAuth();

    // More flexible validation function
    const validateCartData = (data) => {
        if (!data) return false;

        // Handle both array response and object with cart property
        const cartData = Array.isArray(data) ? data : data.cart || data.items || data.products;

        if (!Array.isArray(cartData)) return false;

        // Flexible validation for different possible structures
        return cartData.every(item => {
            const hasId = item.product_id || item.id || item._id;
            const hasProductInfo = item.product_details || item.product || item;
            const hasQuantity = typeof item.quantity === 'number' || typeof item.qty === 'number';

            return hasId && hasProductInfo && hasQuantity;
        });
    };

    // Normalize data from different possible structures
    const normalizeCartData = (data) => {
        const cartData = Array.isArray(data) ? data : data.cart || data.items || data.products || [];

        return cartData.map(item => ({
            product_id: item.product_id || item.id || item._id,
            product_details: {
                ...(item.product_details || item.product || item),
                // Ensure required fields exist with defaults
                product_name: item.product_details?.product_name || item.product?.name || item.name || 'Unknown Product',
                price: item.product_details?.price || item.product?.price || item.price || 0,
                image: item.product_details?.image || item.product?.image || item.image || null
            },
            quantity: item.quantity || item.qty || 1
        }));
    };

    const fetchCart = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');

            if (!token || !user) {
                throw new Error('Not authenticated');
            }

            const response = await API.get('/api/cart', { // Changed from '/api/cart'
                headers: { Authorization: `Bearer ${token}` }
            });

            // Check if response is HTML (indicating wrong endpoint)
            if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
                throw new Error('Server returned HTML instead of cart data. Check API endpoint configuration.');
            }

            if (validateCartData(response.data)) {
                setCart(normalizeCartData(response.data));
            } else {
                console.error('Invalid cart data structure:', response.data);
                throw new Error('The server returned an unexpected cart format');
            }
        } catch (error) {
            console.error('Error fetching cart:', error);

            if (error.response?.status === 401) {
                try {
                    await verifySession();
                    await fetchCart();
                    return;
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    logout();
                    navigate('/login');
                }
            } else {
                setError(
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to load cart. Please try again later.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUnauthorized = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const removeFromCart = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                handleUnauthorized();
                return;
            }

            await API.delete(`/api/cart/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            await fetchCart();
        } catch (error) {
            console.error('Error removing item:', error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                setError(error.response?.data?.message || 'Failed to remove item');
            }
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        try {
            if (newQuantity < 1) {
                await removeFromCart(productId);
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                handleUnauthorized();
                return;
            }

            await API.put(
                `/api/cart/${productId}`,
                { quantity: newQuantity },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            await fetchCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                setError(error.response?.data?.message || 'Failed to update quantity');
            }
        }
    };

    const calculateTotal = () => {
        if (!cart?.length) return 0;
        return cart.reduce(
            (total, item) => total + (item.product_details?.price || 0) * item.quantity,
            0
        ).toFixed(2);
    };

    useEffect(() => {
        // Redirect to home page if the user is not authenticated
        if (!user) {
            navigate('/'); // Redirect to the home page
            return;
        }

        const fetchCart = async () => {
            try {
                setLoading(true); // Start loading
                const response = await API.get('/api/cart');
                setCart(response.data.cart);
                setError(null); // Clear any previous errors
            } catch (err) {
                console.error('Error fetching cart:', err);
                if (err.response?.status === 401) {
                    setError('Unauthorized. Please log in again.');
                } else {
                    setError('Failed to load cart. Please try again later.');
                }
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchCart();
    }, [user, navigate]);


    if (error) {
        return <div>{error}</div>;
    }
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your cart...</p>
            </div>
        );
    }

    // In the return statement, modify the layout structure:
    return (
        <div className="my-cart-container">
            <h1>My Cart</h1>
            {error && (
                <div className="error-message">
                    <p>There was a problem loading your cart</p>
                    <button onClick={() => fetchCart()}>Retry</button>
                    {process.env.NODE_ENV === 'development' && (
                        <small>{error.toString()}</small>
                    )}
                </div>
            )}

            {!cart?.length ? (
                <div className="empty-cart">
                    <p>Your cart is empty</p>
                    <button
                        className="continue-shopping-btn"
                        onClick={() => navigate('/')}
                    >
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <div className="cart-layout">
                    <div className="cart-content">
                        <div className="cart-main">
                            <div className="cart-items">
                                {cart.map((item) => (
                                    <div key={item.product_id} className="cart-item">
                                        {item.product_details?.image ? (
                                            <img
                                                src={item.product_details.image}
                                                alt={item.product_details.product_name}
                                                className="cart-item-image"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/placeholder-image.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="image-placeholder">No Image</div>
                                        )}
                                        <div className="cart-item-details">
                                            <h3>{item.product_details.product_name}</h3>
                                            <p className="price">${(item.product_details.price || 0).toFixed(2)}</p>
                                            <div className="quantity-controls">
                                                <button
                                                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            className="remove-item-btn"
                                            onClick={() => removeFromCart(item.product_id)}
                                            aria-label="Remove item"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="cart-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${calculateTotal()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery</span>
                                <span>$0.00</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>${calculateTotal()}</span>
                            </div>
                            <button
                                className="checkout-btn"
                                onClick={() => navigate('/checkout')}
                                disabled={!cart.length}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCart;