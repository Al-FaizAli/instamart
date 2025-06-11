import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import RecommendationCard from './RecommendationCard';
import './Recommendations.css';
import { useAuth } from '../../context/AuthContext';

const Recommendations = () => {
  const { user } = useAuth();
  const [pastRecommendations, setPastRecommendations] = useState([]);
  const [ourRecommendations, setOurRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

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
    setLoading(true);
    setError(null);

    if (!user?.userId) {
      setError('Please log in to see recommendations.');
      setLoading(false);
      return;
    }

    try {
      const [pastResponse, ourResponse] = await Promise.all([
        axios.get(`https://past-recommendations.onrender.com/recommend/past`, {
          params: { user_id: user.userId }
        }),
        axios.get(`https://past-recommendations.onrender.com/recommend`, {
          params: { user_id: user.userId }
        })
      ]);

      const [pastImages, ourImages] = await Promise.all([
        fetchUnsplashImages('grocery items', pastResponse.data.length),
        fetchUnsplashImages('healthy food', ourResponse.data.length)
      ]);

      setPastRecommendations(pastResponse.data.map((product, index) => ({
        ...product,
        id: `past_${index}`,
        name: product.product,
        price: Math.floor(Math.random() * 100) + 1,
        category: 'Past Product',
        rating: product.rating || 4.0,
        image: pastImages[index]?.urls?.regular || '/images/placeholder.jpg',
        alt: pastImages[index]?.alt_description || product.product
      })));

      setOurRecommendations(ourResponse.data.map((product, index) => ({
        ...product,
        id: `rec_our_${index}`,
        name: product.product,
        price: Math.floor(Math.random() * 100) + 1,
        category: 'Recommended',
        rating: product.rating || 4.5,
        image: ourImages[index]?.urls?.regular || '/images/placeholder.jpg',
        alt: ourImages[index]?.alt_description || product.product
      })));

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
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchRecommendations} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
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