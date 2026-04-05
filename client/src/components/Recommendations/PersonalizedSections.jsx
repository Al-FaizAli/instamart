import React, { useState } from 'react';
import './Recommendations.css';
import API from '../../api';
import { FiShoppingCart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import LoginSignup from '../LoginSignup/LoginSignup';
import PastProducts from './PastProducts';
import RecommendedProducts from './RecommendedProducts';
import { toast } from 'react-hot-toast';

const PersonalizedSections = () => {
  const { user, loading } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [cart, setCart] = useState([]);

  React.useEffect(() => {
    if (user) fetchCart();
  }, [user]);

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

  const handleAdd = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        toast.error('Please login to add items to cart');
        setIsLoginOpen(true);
        return;
      }
      await API.post('/api/cart/add', { product_id: productId, quantity: 1 }, { headers: { 'Content-Type': 'application/json' } });
      await fetchCart();
      toast.success('Item added to cart!');
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleRemove = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        toast.error('Please login to modify cart');
        setIsLoginOpen(true);
        return;
      }
      await API.delete(`/api/cart/${productId}`);
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from cart');
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        toast.error('Please login to modify cart');
        setIsLoginOpen(true);
        return;
      }
      if (newQuantity <= 0) {
        await handleRemove(productId);
        return;
      }
      await API.put(`/api/cart/${productId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const getCartQuantity = (productId) => {
    const item = cart.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your personalized sections...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="recommendations-container">
        <div className="login-prompt-card">
          <div className="login-prompt-icon-wrapper">
             <FiShoppingCart size={32} />
          </div>
          <h2>Unlock Your Personalized Shop</h2>
          <p>
            Log in to see items you've bought before and discover new recommendations picked just for you.
          </p>
          <button className="login-prompt-btn" onClick={() => setIsLoginOpen(true)}>
            Sign In to Your Account
          </button>
        </div>
        {isLoginOpen && (
          <LoginSignup onClose={() => setIsLoginOpen(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <PastProducts 
        user={user} 
        getCartQuantity={getCartQuantity} 
        handleAdd={handleAdd} 
        handleRemove={handleRemove} 
        handleUpdateQuantity={handleUpdateQuantity}
      />
      <RecommendedProducts 
        user={user} 
        getCartQuantity={getCartQuantity} 
        handleAdd={handleAdd} 
        handleRemove={handleRemove} 
        handleUpdateQuantity={handleUpdateQuantity}
      />
      {isLoginOpen && (
        <LoginSignup onClose={() => setIsLoginOpen(false)} />
      )}
    </div>
  );
};

export default PersonalizedSections;
