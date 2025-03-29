import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Aisles.css";

// Unsplash API configuration
const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API = "https://api.unsplash.com/search/photos";

// Hardcoded top 16 aisles data
const TOP_AISLES = [
  { id: 1, name: "candy chocolate" },
  { id: 2, name: "ice cream ice" },
  { id: 3, name: "vitamins supplements" },
  { id: 4, name: "yogurt" },
  { id: 5, name: "chips pretzels" },
  { id: 6, name: "tea" },
  { id: 7, name: "packaged cheese" },
  { id: 8, name: "frozen meals" },
  { id: 9, name: "cookies cakes" },
  { id: 10, name: "energy granola bars" },
  { id: 11, name: "hair care" },
  { id: 12, name: "spices seasonings" },
  { id: 13, name: "juice nectars" },
  { id: 14, name: "crackers" },
  { id: 15, name: "soup broth bouillon" },
  { id: 16, name: "baby food formula" }
];

const capitalizeWords = (str) => {
  return str.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const Aisles = () => {
  const [aisles, setAisles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch images from Unsplash for each aisle
        const aislesWithImages = await Promise.all(
          TOP_AISLES.map(async (aisle) => {
            try {
              const response = await axios.get(
                `${UNSPLASH_API}?query=${encodeURIComponent(aisle.name)}&client_id=${ACCESS_KEY}&per_page=1`
              );

              return {
                ...aisle,
                image: response.data.results[0]?.urls?.small ||
                  `https://source.unsplash.com/random/300x200/?${encodeURIComponent(aisle.name)},grocery`
              };
            } catch (unsplashError) {
              console.error(`Error fetching image for ${aisle.name}:`, unsplashError);
              return {
                ...aisle,
                image: `https://source.unsplash.com/random/300x200/?${encodeURIComponent(aisle.name)},grocery`
              };
            }
          })
        );

        setAisles(aislesWithImages);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleImageLoad = () => {
    setImagesLoaded(prev => prev + 1);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading aisles...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>Error loading aisles: {error}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  return (
    <div className="aisles-section">
      <h2 className="aisles-heading">Popular Aisles</h2>
      <div className="aisles-container">
        {aisles.map((aisle) => (
          <Link
            key={aisle.id}
            to={`/aisle/${aisle.id}`}
            className="aisle-link"
          >
            <div className="aisle-card">
              <div className="aisle-image-container">
                <img
                  src={aisle.image}
                  alt={aisle.name}
                  className="aisle-image"
                  loading="lazy"
                  onLoad={handleImageLoad}
                />
                {imagesLoaded < aisles.length && (
                  <div className="image-placeholder"></div>
                )}
              </div>
              <div className="aisle-info">
                <h3 className="aisle-name">{capitalizeWords(aisle.name)}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Aisles;