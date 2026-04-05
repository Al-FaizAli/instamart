import React, { useEffect, useState } from 'react';
import API from '../../api';
import ProductCard from '../ProductCard/ProductCard';
import './PopularProducts.css';
import { useAuth } from '../../context/AuthContext';
import LoginSignup from '../LoginSignup/LoginSignup';
import { toast } from 'react-hot-toast';

const PopularProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const { user } = useAuth();

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
    fetchCart();
  }, [user]);

  const handleAdd = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        toast.error('Please login to add items to cart');
        setIsLoginOpen(true);
        return;
      }

      const product = products.find(p => p.product_id === productId || p._id === productId);
      if (!product) return;

      await API.post('/api/cart/add', { product_id: product.product_id, quantity: 1 }, { headers: { 'Content-Type': 'application/json' } });
      await fetchCart();
      toast.success(`${product.name || product.product_name} added to cart!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
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

  const isInCart = (productId) => {
    return cart.some(item => item.product_id === productId);
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
              <ProductCard
                key={product.product_id || product._id}
                product={product}
                badgeText="Popular"
                isInCart={isInCart}
                handleAdd={handleAdd}
                handleRemove={handleRemove}
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
