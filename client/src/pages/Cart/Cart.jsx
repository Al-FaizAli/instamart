import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const MyCart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchCart = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setCart(response.data.cart);
            setError('');
        } catch (error) {
            console.error('Error fetching cart:', error);
            setError(error.response?.data?.error || 'Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/cart/remove/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            await fetchCart(); 
        } catch (error) {
            console.error('Error removing item:', error);
            setError(error.response?.data?.error || 'Failed to remove item');
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        try {
            if (newQuantity < 1) {
                await removeFromCart(productId);
                return;
            }

            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:5000/api/cart/update/${productId}`,
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
            setError(error.response?.data?.error || 'Failed to update quantity');
        }
    };

    const calculateTotal = () => {
        if (!cart?.items?.length) return 0;
        return cart.items.reduce(
            (total, item) => total + (item.product.price * item.quantity), 0
        ).toFixed(2);
    };

    useEffect(() => {
        fetchCart();
    }, []);

    if (loading) {
        return <div className="loading-container">Loading your cart...</div>;
    }

    return (
        <div className="my-cart-container">
            <h1>My Cart</h1>
            {error && <div className="error-message">{error}</div>}

            {!cart?.items?.length ? (
                <div className="empty-cart">
                    <p>Your cart is empty</p>
                    <button
                        className="continue-shopping-btn"
                        onClick={() => navigate('/products')}
                    >
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cart.items.map((item) => (
                            <div key={item.product._id} className="cart-item">
                                <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="cart-item-image"
                                />
                                <div className="cart-item-details">
                                    <h3>{item.product.name}</h3>
                                    <p className="price">${item.product.price}</p>
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <button
                                    className="remove-item-btn"
                                    onClick={() => removeFromCart(item.product._id)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
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
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default MyCart;