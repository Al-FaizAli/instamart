import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import RecommendationCard from './RecommendationCard';
import './Recommendations.css';
import API from '../../api';
import { normalizeProduct, normalizeProducts } from '../../utils/productHelpers';

const RecommendedProducts = ({ user, onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cacheKey = useMemo(
    () => (user?.userId ? `ourRecommendations_${user.userId}` : null),
    [user?.userId]
  );

  useEffect(() => {
    const getCachedRecommendations = () => {
      if (!cacheKey) return [];

      try {
        const cached = localStorage.getItem(cacheKey);
        return cached ? JSON.parse(cached) : [];
      } catch (cacheError) {
        console.error('Failed to read recommendations cache:', cacheError);
        return [];
      }
    };

    const setCachedRecommendations = (recommendations) => {
      if (!cacheKey) return;

      try {
        localStorage.setItem(cacheKey, JSON.stringify(recommendations));
      } catch (cacheError) {
        console.error('Failed to store recommendations cache:', cacheError);
      }
    };

    const fetchRecommendedProducts = async () => {
      if (!user?.userId) return;

      const cachedRecommendations = getCachedRecommendations();
      if (cachedRecommendations.length > 0) {
        setProducts(cachedRecommendations);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const recommendationsResponse = await axios.get(
          'https://past-recommendations.onrender.com/recommend',
          {
            params: { user_id: user.userId }
          }
        );

        const productNames = recommendationsResponse.data
          .map((product) => product.product)
          .filter(Boolean);

        const productDetailsResponse = await API.post('/api/products/by-names', {
          names: productNames
        });

        const detailsMap = new Map(
          normalizeProducts(productDetailsResponse.data).map((product) => [
            product.product_name.toLowerCase(),
            product
          ])
        );

        const normalized = recommendationsResponse.data.map((product, index) => {
          const resolvedProduct =
            detailsMap.get(product.product?.toLowerCase()) ||
            normalizeProduct({ product_name: product.product });

          return {
            ...resolvedProduct,
            id: `recommended_${index}`,
            name: product.product,
            category: 'Recommended',
            rating: Number(product.rating) || resolvedProduct.rating || 4.5,
            alt: product.product
          };
        });

        setProducts(normalized);
        setCachedRecommendations(normalized);
      } catch (requestError) {
        console.error('Failed to load recommended products:', requestError);

        const cachedRecommendations = getCachedRecommendations();
        if (cachedRecommendations.length > 0) {
          setProducts(cachedRecommendations);
          setError('Showing cached recommendations. Some data may be outdated.');
        } else {
          setProducts([]);
          setError(requestError.response?.data?.message || 'Failed to load recommendations.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [cacheKey, user?.userId]);

  if (!user) return null;

  return (
    <section className="recommendation-section">
      <h2>Our Recommendations</h2>
      {loading ? (
        <div className="loading-message">Loading recommendations...</div>
      ) : (
        <div className="scrollable-container">
          {products.length > 0 ? (
            products.map((product) => (
              <RecommendationCard
                key={product.id}
                product={product}
                type="our"
                onAddToCart={onAddToCart}
              />
            ))
          ) : (
            <p className="no-items">{error || 'No recommendations available.'}</p>
          )}
        </div>
      )}
      {error && products.length > 0 && <div className="cache-warning">{error}</div>}
    </section>
  );
};

export default React.memo(RecommendedProducts);
