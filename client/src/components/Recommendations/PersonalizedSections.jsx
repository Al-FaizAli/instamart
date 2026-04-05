import React, { useState } from 'react';
import './Recommendations.css';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import LoginSignup from '../LoginSignup/LoginSignup';
import PastProducts from './PastProducts';
import RecommendedProducts from './RecommendedProducts';
import { toast } from 'react-hot-toast';

const PersonalizedSections = () => {
  const { user, loading } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to add items to cart');
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

      toast.success(`${product.product_name || product.name} added to cart!`);
    } catch (requestError) {
      console.error('Error adding to cart:', requestError);
      toast.error(requestError.response?.data?.message || 'Failed to add to cart');
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
      <PastProducts user={user} onAddToCart={handleAddToCart} />
      <RecommendedProducts user={user} onAddToCart={handleAddToCart} />
      {isLoginOpen && (
        <LoginSignup onClose={() => setIsLoginOpen(false)} />
      )}
    </div>
  );
};

export default PersonalizedSections;
