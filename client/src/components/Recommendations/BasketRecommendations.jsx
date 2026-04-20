import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../../api';
import ProductCard from '../ProductCard/ProductCard';
import './Recommendations.css';
import { normalizeProducts } from '../../utils/productHelpers';

const BasketRecommendations = ({ cart, getCartQuantity, handleAdd, handleRemove, handleUpdateQuantity }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!cart || cart.length === 0) {
        setRecommendations([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        // 1. Get cart product IDs
        const cartProductIds = cart.map(item => Number(item.product_id)).filter(id => !isNaN(id));
        
        if (cartProductIds.length === 0) {
            setLoading(false);
            return;
        }

        // 2. Query BasketGPT prediction API
        const mlBaseUrl = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';
        const mlResponse = await axios.post(`${mlBaseUrl}/api/recommendation/basket-complete`, {
          cart_product_ids: cartProductIds,
          num_suggestions: 5,
          temperature: 0.7,
          top_k: 20
        });

        const mlRecommendations = mlResponse.data.suggestions || [];
        
        if (mlRecommendations.length === 0) {
            setRecommendations([]);
            setLoading(false);
            return;
        }

        // 3. The ML API returns { product_id, product_name, confidence, rank }.
        const names = mlRecommendations.map(rec => rec.product_name);
        
        const productsResponse = await API.post('/api/products/by-names', { names });
        
        // 4. Normalize the products and combine
        const normalized = normalizeProducts(productsResponse.data).map((product, index) => {
           const mlData = mlRecommendations.find(rec => rec.product_name === product.product_name) || {};
           return {
              ...product,
              id: `basketrec_${product.product_id || index}`,
              name: product.product_name,
              category: 'Complete Your Basket',
              rating: Number(product.rating) || 4.5,
              alt: product.product_name,
              score: mlData.confidence || 0
           };
        });

        // Filter out items already in the cart
        const cartIds = new Set(cart.map(item => item.product_id));
        const finalRecommendations = normalized.filter(item => !cartIds.has(item.product_id));

        setRecommendations(finalRecommendations);

      } catch (err) {
        console.error('Failed to get basket recommendations:', err);
        setError('Recommendations currently unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [cart]);

  if (!cart || cart.length === 0) return null;
  if (!loading && recommendations.length === 0) return null;

  return (
    <section className="recommendation-section">
      <h2>Complete Your Basket</h2>
      {loading ? (
        <div className="loading-message">Analyzing your cart for the perfect matches...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="scrollable-container">
          {recommendations.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              badgeText="Recommended"
              getCartQuantity={getCartQuantity}
              handleAdd={handleAdd}
              handleRemove={handleRemove}
              handleUpdateQuantity={handleUpdateQuantity}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default React.memo(BasketRecommendations);
