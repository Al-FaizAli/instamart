import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import RecommendationCard from './RecommendationCard';
import './Recommendations.css';
import { useAuth } from '../../context/AuthContext';
import LoginSignup from '../LoginSignup/LoginSignup';
import { fetchUnsplashImages } from '../../utils/fetchUnsplashImage';
const Recommendations = () => {
  const { user } = useAuth();
  const [pastRecommendations, setPastRecommendations] = useState([]);
  const [ourRecommendations, setOurRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  // Helper to get cached recommendations
  const getCached = useCallback(() => {
    if (!user?.userId) return { past: [], our: [] };
    const cachedPast = localStorage.getItem(`pastRecommendations_${user.userId}`);
    const cachedOur = localStorage.getItem(`ourRecommendations_${user.userId}`);
    return {
      past: cachedPast ? JSON.parse(cachedPast) : [],
      our: cachedOur ? JSON.parse(cachedOur) : []
    };
  }, [user?.userId]);

  // Main fetch logic
  const fetchRecommendations = useCallback(async (force = false) => {
    setError(null);
    if (!user?.userId) {
      setError('Please log in to see recommendations.');
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Try cache first (unless force refresh)
    if (!force) {
      const { past, our } = getCached();
      if (past.length > 0 && our.length > 0) {
        setPastRecommendations(past);
        setOurRecommendations(our);
        setLoading(false);
        return;
      }
    }

    // 2. Fetch from API if cache is missing or force is true
    try {
      const [pastResponse, ourResponse] = await Promise.all([
        axios.get(`https://past-recommendations.onrender.com/recommend/past`, {
          params: { user_id: user.userId }
        }),
        axios.get(`https://past-recommendations.onrender.com/recommend`, {
          params: { user_id: user.userId }
        })
      ]);

      // Get cached images for deduplication
      const { past: cachedPast, our: cachedOur } = getCached();

      const getCachedImage = (productName, cachedArr) => {
        const found = cachedArr.find(p => p.name === productName);
        return found ? found.image : null;
      };

      // Only fetch images for products not in cache
      const pastImagesNeeded = pastResponse.data.filter(
        p => !getCachedImage(p.product, cachedPast)
      );
      const ourImagesNeeded = ourResponse.data.filter(
        p => !getCachedImage(p.product, cachedOur)
      );

      const [pastImages, ourImages] = await Promise.all([
        fetchUnsplashImages('grocery items', pastImagesNeeded.length),
        fetchUnsplashImages('healthy food', ourImagesNeeded.length)
      ]);

      // Build past recommendations
      let past = pastResponse.data.map((product, index) => {
        const cachedImage = getCachedImage(product.product, cachedPast);
        let image, alt;
        if (cachedImage) {
          image = cachedImage;
          alt = product.product;
        } else {
          const imgObj = pastImages.shift() || {};
          image = imgObj.urls?.regular || '/images/placeholder.jpg';
          alt = imgObj.alt_description || product.product;
        }
        return {
          ...product,
          id: `past_${index}`,
          name: product.product,
          price: Math.floor(Math.random() * 100) + 1,
          category: 'Past Product',
          rating: product.rating || 4.0,
          image,
          alt
        };
      });

      // Build our recommendations
      let our = ourResponse.data.map((product, index) => {
        const cachedImage = getCachedImage(product.product, cachedOur);
        let image, alt;
        if (cachedImage) {
          image = cachedImage;
          alt = product.product;
        } else {
          const imgObj = ourImages.shift() || {};
          image = imgObj.urls?.regular || '/images/placeholder.jpg';
          alt = imgObj.alt_description || product.product;
        }
        return {
          ...product,
          id: `rec_our_${index}`,
          name: product.product,
          price: Math.floor(Math.random() * 100) + 1,
          category: 'Recommended',
          rating: product.rating || 4.5,
          image,
          alt
        };
      });

      setPastRecommendations(past);
      setOurRecommendations(our);

      // Cache to localStorage
      localStorage.setItem(`pastRecommendations_${user.userId}`, JSON.stringify(past));
      localStorage.setItem(`ourRecommendations_${user.userId}`, JSON.stringify(our));
    } catch (err) {
      // On error, try to show cache if available
      const { past, our } = getCached();
      if (past.length > 0 || our.length > 0) {
        setPastRecommendations(past);
        setOurRecommendations(our);
        setError('Showing cached recommendations. Some data may be outdated.');
      } else {
        setPastRecommendations([]);
        setOurRecommendations([]);
        setError('Failed to load recommendations.');
      }
    } finally {
      setLoading(false);
    }
  }, [user, fetchUnsplashImages, getCached]);


  // Add to cart logic
  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartMessage('Please login to add items to cart');
        setIsLoginOpen(true);
        return;
      }

      // Use product fields, fallback to alternatives if needed
      await axios.post(
        'http://localhost:5000/api/cart/add',
        {
          product_id: product.product_id,
          name: product.product_name,
          price: product.price || 10.99,
          image: product.image,
          quantity: 1
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setCartMessage(`${product.product_name || product.name} added to cart!`);
      setTimeout(() => setCartMessage(''), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartMessage(error.response?.data?.error || 'Failed to add to cart');
      setTimeout(() => setCartMessage(''), 2000);
    }
  };
  // On mount, load from cache or fetch if missing
  useEffect(() => {
    if (!user?.userId) return;
    fetchRecommendations();
    // eslint-disable-next-line
  }, [user?.userId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading recommendations...</p>
      </div>
    );
  }

  if (!user?.userId || error && pastRecommendations.length === 0 && ourRecommendations.length === 0) {
    return (
      <div className="error-container-recommendation">
        {!user?.userId ? (
          <>
            <p className="error-message">Please log in to see recommendations.</p>
            <button
              className="login-button"
              onClick={() => setIsLoginOpen(true)}
            >
              Login
            </button>
            {isLoginOpen && (
              <LoginSignup onClose={() => setIsLoginOpen(false)} />
            )}
          </>
        ) : (
          <>
            <p className="error-message">{error}</p>
            <button onClick={() => fetchRecommendations(true)} className="retry-button">
              Retry
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      {cartMessage && (
        <div className="cart-message">{cartMessage}</div>
      )}
      <section className="recommendation-section">
        <h2>Your Past Products</h2>
        <div className="scrollable-container">
          {pastRecommendations.length > 0 ? (
            pastRecommendations.map((product) => (
              <RecommendationCard
                key={product.id}
                product={product}
                type="past"
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <p className="no-items">No past products found.</p>
          )}
        </div>
      </section>

      <section className="recommendation-section">
        <h2>Our Recommendations</h2>
        <div className="scrollable-container">
          {ourRecommendations.length > 0 ? (
            ourRecommendations.map((product) => (
              <RecommendationCard
                key={product.id}
                product={product}
                type="our"
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <p className="no-items">No recommendations available.</p>
          )}
        </div>
      </section>
      {error && <div className="cache-warning">{error}</div>}
    </div>
  );
};

export default React.memo(Recommendations);