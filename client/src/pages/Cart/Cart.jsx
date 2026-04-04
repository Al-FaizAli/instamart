import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Cart.css';
import API from '../../api';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../../utils/productHelpers';

const MyCart = () => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, logout, verifySession } = useAuth();

    const normalizeCartData = (data) => {
        const cartData = Array.isArray(data) ? data : data.cart || [];

        return cartData.map((item) => {
            const productDetails = item.product_details || item.product || {};
            const numericPrice = Number(productDetails.price ?? item.price);

            return {
                product_id: item.product_id || productDetails.product_id || productDetails._id,
                quantity: item.quantity || item.qty || 1,
                product_details: {
                    ...productDetails,
                    product_name: productDetails.product_name || item.name || 'Unknown Product',
                    price: Number.isFinite(numericPrice) ? numericPrice : 0,
                    image_link: productDetails.image_link || productDetails.image || item.image || '',
                },
            };
        });
    };

    const fetchCart = async () => {
        setLoading(true);
        setError('');

        try {
            if (!user) {
                navigate('/');
                return;
            }

            const response = await API.get('/api/cart');
            setCart(normalizeCartData(response.data));
        } catch (err) {
            console.error('Error fetching cart:', err);

            if (err.response?.status === 401) {
                try {
                    await verifySession();
                    const retryResponse = await API.get('/api/cart');
                    setCart(normalizeCartData(retryResponse.data));
                    return;
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    logout();
                    navigate('/login');
                    return;
                }
            }

            setError(err.response?.data?.message || 'Failed to load cart. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            await API.delete(`/api/cart/${productId}`);
            await fetchCart();
        } catch (err) {
            console.error('Error removing item:', err);
            setError(err.response?.data?.message || 'Failed to remove item');
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        try {
            if (newQuantity < 1) {
                await removeFromCart(productId);
                return;
            }

            await API.put(`/api/cart/${productId}`, { quantity: newQuantity });
            await fetchCart();
        } catch (err) {
            console.error('Error updating quantity:', err);
            setError(err.response?.data?.message || 'Failed to update quantity');
        }
    };

    const calculateTotal = () => {
        if (!cart.length) return '0.00';

        return cart
            .reduce((total, item) => total + (item.product_details.price || 0) * item.quantity, 0)
            .toFixed(2);
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

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

    return (
        <div className="my-cart-container">
            <h1>My Cart</h1>

            {!cart.length ? (
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
                                        <img
                                            src={item.product_details.image_link || PRODUCT_PLACEHOLDER_IMAGE}
                                            alt={item.product_details.product_name}
                                            className="cart-item-image"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = PRODUCT_PLACEHOLDER_IMAGE;
                                            }}
                                        />
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
                                            x
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
