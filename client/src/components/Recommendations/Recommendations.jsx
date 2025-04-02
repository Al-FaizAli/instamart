import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecommendationCard from './RecommendationCard';
import './Recommendations.css';
import { useAuth } from '../../context/AuthContext'; // Import AuthContext to get the logged-in user

const Recommendations = () => {
  const { user } = useAuth(); // Get the logged-in user
  const [pastRecommendations, setPastRecommendations] = useState([]);
  const [ourRecommendations, setOurRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  const generateProductDetails = (product, index, type) => {
    const prices = [80, 25, 16, 74];
    const ratings = [4, 4.5, 5, 3.5];
    const categories = ['Dairy', 'Bakery', 'Vegetables', 'Beverages'];

    return {
      ...product,
      id: `rec_${type}_${index}`,
      name: product.alt_description || `${type} product ${index + 1}`,
      price: prices[index % prices.length],
      rating: ratings[index % ratings.length],
      category: categories[index % categories.length]
    };
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    if (!user || !user.userId) {
      console.error('User is not logged in or userId is missing.');
      setError('Please log in to see recommendations.');
      return;
    }
    try {
      // Fetch past recommendations for the logged-in user
      if (user) {
        const pastResponse = await axios.get(`https://collab-new.onrender.com/recommend/past`, {
          params: { user_id: user.userId }
        });
        setPastRecommendations(pastResponse.data);
      }

      // Fetch our recommendations (using Unsplash API as an example)
      const ourResponse = await axios.get(
        `https://api.unsplash.com/search/photos?query=healthy+food+vegetables&client_id=${ACCESS_KEY}&per_page=6`
      );
      const ourWithDetails = ourResponse.data.results.map((product, index) =>
        generateProductDetails(product, index, 'our')
      );
      setOurRecommendations(ourWithDetails);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  if (loading) {
    return <div className="loading-message">Loading recommendations...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="recommendations-container">
      <section className="recommendation-section">
        <h2>Your Past Products</h2>
        <div className="scrollable-container">
          {pastRecommendations.length > 0 ? (
            pastRecommendations.map((product, index) => (
              <RecommendationCard
                key={`past_${index}`}
                product={{
                  id: `past_${index}`,
                  name: product.product,
                  rating: product.rating,
                  price: Math.floor(Math.random() * 100) + 1, // Random price for display
                  category: 'Past Product'
                }}
                type="past"
              />
            ))
          ) : (
            <p>No past products found.</p>
          )}
        </div>
      </section>

      <section className="recommendation-section">
        <h2>Our Recommendations</h2>
        <div className="scrollable-container">
          {ourRecommendations.map((product) => (
            <RecommendationCard key={product.id} product={product} type="our" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Recommendations;