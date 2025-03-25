import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecommendationCard from './RecommendationCard';
import './Recommendations.css';

const Recommendations = () => {
  const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const [pastRecommendations, setPastRecommendations] = useState([]);
  const [ourRecommendations, setOurRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

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
    try {
      const pastResponse = await axios.get(
        `https://api.unsplash.com/search/photos?query=grocery+dairy+bakery&client_id=${ACCESS_KEY}&per_page=10`
      );
      const pastWithDetails = pastResponse.data.results.map((product, index) =>
        generateProductDetails(product, index, 'past')
      );
      setPastRecommendations(pastWithDetails);

      const ourResponse = await axios.get(
        `https://api.unsplash.com/search/photos?query=healthy+food+vegetables&client_id=${ACCESS_KEY}&per_page=6`
      );
      const ourWithDetails = ourResponse.data.results.map((product, index) =>
        generateProductDetails(product, index, 'our')
      );
      setOurRecommendations(ourWithDetails);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return <div className="loading-message">Loading recommendations...</div>;
  }

  return (
    <div className="recommendations-container">
      <section className="recommendation-section">
        <h2>Past Recommendations</h2>
        <div className="scrollable-container">
          {pastRecommendations.map((product) => (
            <RecommendationCard key={product.id} product={product} type="past" />
          ))}
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