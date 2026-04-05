import React, { useEffect, useState } from 'react';
import API from '../../api';
import RecommendationCard from '../Recommendations/RecommendationCard';
import './PopularProducts.css';
import { useAuth } from '../../context/AuthContext';
import LoginSignup from '../LoginSignup/LoginSignup';
import { toast } from 'react-hot-toast';

const PopularProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        const response = await API.get('/api/products/popular');
        // Format products for RecommendationCard
        const formatted = response.data.map((prod) => ({
          ...prod,
          name: prod.product_name,
          category: prod.department?.department || 'Popular',
          rating: 4.5,
          price: prod.price || 0,
        }));
        setProducts(formatted);
      } catch (err) {
        console.error('Failed to load popular products:', err);
        setError('Failed to load popular items.');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
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

      toast.success(`${product.name} added to cart!`);
    } catch (requestError) {
      console.error('Error adding to cart:', requestError);
      toast.error(requestError.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <section className="popular-products-section">
      <div className="popular-products-container">
        <div className="popular-header">
          <h2>Popular Selling Items</h2>
          <p>Trending products loved by everyone</p>
        </div>

        {loading ? (
          <div className="loading-message">Loading popular items...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="scrollable-container">
            {products.map((product) => (
              <RecommendationCard
                key={product.product_id || product._id}
                product={product}
                type="our"
                badgeText="Popular"
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {isLoginOpen && (
          <LoginSignup onClose={() => setIsLoginOpen(false)} />
        )}
      </div>
    </section>
  );
};

export default PopularProducts;
