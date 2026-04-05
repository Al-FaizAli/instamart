import React, { useEffect, useState, useMemo } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './Recommendations.css';
import API from '../../api';
import { normalizeProducts } from '../../utils/productHelpers';

const PastProducts = ({ user, isInCart, handleAdd, handleRemove }) => {
  const [pastProducts, setPastProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cacheKey = useMemo(
    () => (user?.userId ? `pastProducts_${user.userId}` : null),
    [user?.userId]
  );

  useEffect(() => {
    const getCachedPastProducts = () => {
      if (!cacheKey) return [];
      try {
        const cached = localStorage.getItem(cacheKey);
        return cached ? JSON.parse(cached) : [];
      } catch (cacheError) {
        console.error('Failed to read past products cache:', cacheError);
        return [];
      }
    };

    const setCachedPastProducts = (products) => {
      if (!cacheKey) return;
      try {
        localStorage.setItem(cacheKey, JSON.stringify(products));
      } catch (cacheError) {
        console.error('Failed to store past products cache:', cacheError);
      }
    };

    const fetchPastProducts = async () => {
      if (!user?.userId) return;

      const cachedProducts = getCachedPastProducts();
      if (cachedProducts.length > 0) {
        setPastProducts(cachedProducts);
        return;
      }

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
        setCachedPastProducts(normalized);
      } catch (requestError) {
        console.error('Failed to load past products:', requestError);
        const cachedProducts = getCachedPastProducts();
        if (cachedProducts.length > 0) {
          setPastProducts(cachedProducts);
          setError('Showing cached products. Some data may be outdated.');
        } else {
          setPastProducts([]);
          setError(requestError.response?.data?.message || 'Failed to load past products.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPastProducts();
  }, [cacheKey, user?.userId]);

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
              <ProductCard
                key={product.id}
                product={product}
                badgeText="Past"
                isInCart={isInCart}
                handleAdd={handleAdd}
                handleRemove={handleRemove}
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
