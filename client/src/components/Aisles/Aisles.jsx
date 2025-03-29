import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Aisles.css";

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API = "https://api.unsplash.com/search/photos";

const TOP_AISLES = [
  { id: 45, name: "candy chocolate" },
  { id: 37, name: "ice cream ice" },
  { id: 47, name: "vitamins supplements" },
  { id: 120, name: "yogurt" },
  { id: 107, name: "chips pretzels" },
  { id: 94, name: "tea" },
  { id: 21, name: "packaged cheese" },
  { id: 38, name: "frozen meals" },
  { id: 61, name: "cookies cakes" },
  { id: 3, name: "energy granola bars" },
  { id: 22, name: "hair care" },
  { id: 104, name: "spices seasonings" },
  { id: 98, name: "juice nectars" },
  { id: 78, name: "crackers" },
  { id: 69, name: "soup broth bouillon" },
  { id: 92, name: "baby food formula" }
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