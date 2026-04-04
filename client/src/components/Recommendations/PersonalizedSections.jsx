import React, { useState } from 'react';
import './Recommendations.css';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import LoginSignup from '../LoginSignup/LoginSignup';
import PastProducts from './PastProducts';
import RecommendedProducts from './RecommendedProducts';

const PersonalizedSections = () => {
  const { user, loading } = useAuth();
  const [cartMessage, setCartMessage] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartMessage('Please login to add items to cart');
        setIsLoginOpen(true);
        return;
      }

      await API.post(
        '/api/cart/add',
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

      setCartMessage(`${product.product_name || product.name} added to cart!`);
      setTimeout(() => setCartMessage(''), 2000);
    } catch (requestError) {
      console.error('Error adding to cart:', requestError);
      setCartMessage(requestError.response?.data?.message || 'Failed to add to cart');
      setTimeout(() => setCartMessage(''), 2000);
    }
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
    return null;
  }

  return (
    <div className="recommendations-container">
      {cartMessage && <div className="cart-message">{cartMessage}</div>}
      <PastProducts user={user} onAddToCart={handleAddToCart} />
      <RecommendedProducts user={user} onAddToCart={handleAddToCart} />
      {isLoginOpen && (
        <LoginSignup onClose={() => setIsLoginOpen(false)} />
      )}
    </div>
  );
};

export default PersonalizedSections;
