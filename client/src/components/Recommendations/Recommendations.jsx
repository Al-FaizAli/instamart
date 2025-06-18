import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import RecommendationCard from './RecommendationCard';
import './Recommendations.css';
import { useAuth } from '../../context/AuthContext';
import LoginSignup from '../LoginSignup/LoginSignup';
const Recommendations = () => {
  const { user } = useAuth();
  const [pastRecommendations, setPastRecommendations] = useState([]);
  const [ourRecommendations, setOurRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Load cached recommendations on mount
  useEffect(() => {
    if (user?.userId) {
      const cachedPast = localStorage.getItem(`pastRecommendations_${user.userId}`);
      const cachedOur = localStorage.getItem(`ourRecommendations_${user.userId}`);
      if (cachedPast) setPastRecommendations(JSON.parse(cachedPast));
      if (cachedOur) setOurRecommendations(JSON.parse(cachedOur));
      // Only set loading to true if no cache
      if (!cachedPast && !cachedOur) setLoading(true);
      else setLoading(false);
    }
  }, [user?.userId]);

  const fetchUnsplashImages = useCallback(async (query, count) => {
    try {
      if (!UNSPLASH_ACCESS_KEY) {
        console.warn('Unsplash API key not found, using placeholders');
        return Array(count).fill({ urls: { regular: '/images/placeholder.jpg' } });
      }

      const response = await axios.get(
        `https://api.unsplash.com/search/photos`,
        {
          params: {
            query: query,
            per_page: count,
            orientation: 'squarish'
          },
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      );
      return response.data.results;
    } catch (err) {
      console.error('Error fetching Unsplash images:', err);
      return Array(count).fill({ urls: { regular: '/images/placeholder.jpg' } });
    }
  }, [UNSPLASH_ACCESS_KEY]);

  const fetchRecommendations = useCallback(async () => {
    // setLoading(true);
    setError(null);

    if (!user?.userId) {
      setError('Please log in to see recommendations.');
      setLoading(false);
      return;
    }

    try {
      // Fetch product data
      const [pastResponse, ourResponse] = await Promise.all([
        axios.get(`https://past-recommendations.onrender.com/recommend/past`, {
          params: { user_id: user.userId }
        }),
        axios.get(`https://past-recommendations.onrender.com/recommend`, {
          params: { user_id: user.userId }
        })
      ]);

      // Check cache for images
      const cachedPast = JSON.parse(localStorage.getItem(`pastRecommendations_${user.userId}`) || "[]");
      const cachedOur = JSON.parse(localStorage.getItem(`ourRecommendations_${user.userId}`) || "[]");

      // Helper to find cached image for a product
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

      // Fetch only needed images
      const [pastImages, ourImages] = await Promise.all([
        fetchUnsplashImages('grocery items', pastImagesNeeded.length),
        fetchUnsplashImages('healthy food', ourImagesNeeded.length)
      ]);

      // Build past recommendations with cached or new images
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

      // Build our recommendations with cached or new images
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
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Failed to load recommendations.');
      setPastRecommendations([]);
      setOurRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [user, fetchUnsplashImages]);
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container-recommendation">
        <p className="error-message">{error}</p>
        {!user?.userId ? (
          <>
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
          <button onClick={fetchRecommendations} className="retry-button">
            Retry
          </button>
        )}
      </div>
    );
  } return (
    <div className="recommendations-container">
      <section className="recommendation-section">
        <h2>Your Past Products</h2>
        <div className="scrollable-container">
          {pastRecommendations.length > 0 ? (
            pastRecommendations.map((product) => (
              <RecommendationCard key={product.id} product={product} type="past" />
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
              <RecommendationCard key={product.id} product={product} type="our" />
            ))
          ) : (
            <p className="no-items">No recommendations available.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default React.memo(Recommendations);