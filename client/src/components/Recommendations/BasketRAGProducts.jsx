import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../ProductCard/ProductCard';
import './Recommendations.css';
import API from '../../api';
import { normalizeProducts } from '../../utils/productHelpers';

const BasketRAGProducts = ({ user, getCartQuantity, handleAdd, handleRemove, handleUpdateQuantity }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBasketRAGRecommendations = async () => {
      if (!user?.userId) return;

      setLoading(true);
      setError('');

      try {
        // 1. Fetch user's past products
        const pastProductsResponse = await API.get('/api/recommendations/past', {
          params: { userId: user.userId }
        });

        const pastProducts = pastProductsResponse.data;
        if (!pastProducts || pastProducts.length === 0) {
          setRecommendations([]);
          setLoading(false);
          return;
        }

        // 2. Extract product IDs to represent the "last basket" context
        const cartProductIds = pastProducts.map(p => Number(p.product_id)).filter(id => !isNaN(id));

        if (cartProductIds.length === 0) {
          setRecommendations([]);
          setLoading(false);
          return;
        }

        // 3. Query BasketRAG API
        const mlBaseUrl = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';
        const mlResponse = await axios.post(`${mlBaseUrl}/api/recommendation/basket-rag`, {
          cart_product_ids: cartProductIds,
          top_k: 20
        });

        const mlRecommendations = mlResponse.data.recommendations || [];
        
        if (mlRecommendations.length === 0) {
          setRecommendations([]);
          setLoading(false);
          return;
        }

        // 4. Fetch full product details by names 
        const names = mlRecommendations.map(rec => rec.name);
        
        if (names.length === 0) {
          setRecommendations([]);
          setLoading(false);
          return;
        }

        const productsResponse = await API.post('/api/products/by-names', { names });
        
        // 5. Normalize and merge
        const normalized = normalizeProducts(productsResponse.data).map((product, index) => {
           const mlData = mlRecommendations.find(rec => rec.name === product.product_name) || {};
           return {
              ...product,
              id: `basketrag_${product.product_id || index}`,
              name: product.product_name,
              category: 'Inspired by Your History',
              rating: Number(product.rating) || 4.6,
              alt: product.product_name,
              score: mlData.score || 0
           };
        });
        
        // Sort by score
        normalized.sort((a, b) => (b.score || 0) - (a.score || 0));

        setRecommendations(normalized);

      } catch (err) {
        console.error('Failed to get BasketRAG recommendations:', err);
        setError('AI Recommendations currently unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchBasketRAGRecommendations();
  }, [user?.userId]);

  if (!user) return null;

  return (
    <section className="recommendation-section">
      <h2>Inspired by Your History</h2>
      {loading ? (
        <div className="loading-message">Curating products based on your shopping habits...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="scrollable-container">
          {recommendations.length > 0 ? (
            recommendations.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                badgeText="Picked For You"
                getCartQuantity={getCartQuantity}
                handleAdd={handleAdd}
                handleRemove={handleRemove}
                handleUpdateQuantity={handleUpdateQuantity}
              />
            ))
          ) : (
            <p className="no-items">Keep shopping to unlock personalized AI recommendations!</p>
          )}
        </div>
      )}
    </section>
  );
};

export default React.memo(BasketRAGProducts);
