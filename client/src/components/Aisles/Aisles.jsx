import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Aisles.css";
import { fetchUnsplashImage } from '../../utils/fetchUnsplashImage';

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

const CACHE_KEY = "aisleImagesCache_v1";

const Aisles = () => {
  const [aisles, setAisles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Load cache from localStorage
        let cache = {};
        try {
          cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
        } catch {
          cache = {};
        }

        // 2. For each aisle, use cached image or fetch new one
        const aislesWithImages = await Promise.all(
          TOP_AISLES.map(async (aisle) => {
            if (cache[aisle.id]) {
              return { ...aisle, image: cache[aisle.id] };
            }
            try {
              const image = await fetchUnsplashImage(
                aisle.name,
                `https://source.unsplash.com/random/300x200/?${encodeURIComponent(aisle.name)},grocery`
              );
              // Save to cache
              cache[aisle.id] = image;
              return { ...aisle, image };
            } catch (unsplashError) {
              console.error(`Error fetching image for ${aisle.name}:`, unsplashError);
              const fallback = `https://source.unsplash.com/random/300x200/?${encodeURIComponent(aisle.name)},grocery`;
              cache[aisle.id] = fallback;
              return { ...aisle, image: fallback };
            }
          })
        );

        // 3. Save updated cache
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
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