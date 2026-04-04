import React, { useEffect, useState } from 'react';
import RecommendationCard from './RecommendationCard';
import './Recommendations.css';
import API from '../../api';
import { normalizeProducts } from '../../utils/productHelpers';

const PastProducts = ({ user, onAddToCart }) => {
  const [pastProducts, setPastProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPastProducts = async () => {
      if (!user?.userId) return;

      setLoading(true);
      setError('');

      try {
        const response = await API.get('/api/recommendations/past', {
          params: { userId: user.userId }
        });

        const normalized = normalizeProducts(response.data).map((product, index) => ({
          ...product,
          id: `past_${product.product_id || index}`,
          name: product.product_name,
          category: 'Past Product',
          rating: Number(product.rating) || 4.3,
          alt: product.product_name
        }));

        setPastProducts(normalized);
      } catch (requestError) {
        console.error('Failed to load past products:', requestError);
        setPastProducts([]);
        setError(requestError.response?.data?.message || 'Failed to load past products.');
      } finally {
        setLoading(false);
      }
    };

    fetchPastProducts();
  }, [user?.userId]);

  if (!user) return null;

  return (
    <section className="recommendation-section">
      <h2>Your Past Products</h2>
      {loading ? (
        <div className="loading-message">Loading past products...</div>
      ) : (
        <div className="scrollable-container">
          {pastProducts.length > 0 ? (
            pastProducts.map((product) => (
              <RecommendationCard
                key={product.id}
                product={product}
                type="past"
                onAddToCart={onAddToCart}
              />
            ))
          ) : (
            <p className="no-items">{error || 'No past products found.'}</p>
          )}
        </div>
      )}
    </section>
  );
};

export default React.memo(PastProducts);
