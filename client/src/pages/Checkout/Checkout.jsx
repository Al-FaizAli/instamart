import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import API from '../../api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchCart = async () => {
      try {
        const response = await API.get('/api/cart');
        const data = Array.isArray(response.data) ? response.data : (response.data.cart || []);
        if (data.length === 0) {
           toast.error("Your cart is empty!");
           navigate('/');
        }
        setCart(data);
      } catch (err) {
        console.error('Error fetching cart:', err);
        toast.error('Failed to load cart data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    if (!cart.length) return '0.00';
    return cart.reduce((total, item) => {
      const price = item.product_details?.price || item.price || 0;
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        // Clear the cart on successful "payment"
        await API.delete('/api/cart');
        
        toast.success('Order placed successfully! Thank you for shopping.');
        setProcessing(false);
        navigate('/');
      } catch (err) {
        console.error('Error clearing cart:', err);
        toast.error('Payment processed, but failed to clear cart.');
        setProcessing(false);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="spinner"></div>
        <p>Loading secure checkout...</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Secure Checkout</h1>
      </div>
      
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleCheckout}>
          <div className="form-section">
            <h2>Shipping Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="John" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Doe" />
              </div>
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com" />
            </div>

            <div className="form-group">
              <label>Street Address</label>
              <input type="text" name="address" required value={formData.address} onChange={handleChange} placeholder="123 Main St" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" required value={formData.city} onChange={handleChange} placeholder="New York" />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input type="text" name="zipCode" required pattern="\d{5}" value={formData.zipCode} onChange={handleChange} placeholder="10001" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Payment Details</h2>
            <div className="form-group">
              <label>Card Number</label>
              <input 
                type="text" 
                name="cardNumber" 
                required 
                maxLength="19"
                pattern="\d{4}\s?\d{4}\s?\d{4}\s?\d{4}"
                value={formData.cardNumber} 
                onChange={handleChange} 
                placeholder="0000 0000 0000 0000" 
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Expiration Date</label>
                <input type="text" name="expiry" required pattern="\d*\/?\d*" maxLength="5" value={formData.expiry} onChange={handleChange} placeholder="MM/YY" />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input type="text" name="cvv" required maxLength="4" value={formData.cvv} onChange={handleChange} placeholder="123" />
              </div>
            </div>
          </div>

          <button type="submit" className="pay-now-btn" disabled={processing || cart.length === 0}>
            {processing ? 'Processing Payment...' : `Pay $${calculateTotal()}`}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cart.map((item, idx) => (
              <div key={idx} className="summary-item">
                <span className="item-name">{item.quantity}x {item.product_details?.product_name || item.name || 'Product'}</span>
                <span className="item-price">${((item.product_details?.price || item.price || 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="summary-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>${calculateTotal()}</span>
            </div>
            <div className="total-row">
              <span>Delivery Fee</span>
              <span>$0.00</span>
            </div>
            <div className="total-row grand-total">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
