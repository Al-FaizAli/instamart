import { useState } from "react";
import { Link } from "react-router-dom";
import "./Aisles.css";

const TOP_AISLES = [
  { id: 45, name: "candy chocolate", image: "/aisles/Candy Chocolate.avif", gradient: "linear-gradient(135deg, #8B5CF6, #6D28D9)" },
  { id: 37, name: "ice cream ice", image: "/aisles/Ice Cream Ice.avif", gradient: "linear-gradient(135deg, #EC4899, #DB2777)" },
  { id: 47, name: "vitamins supplements", image: "/aisles/Vitamins Supplements.avif", gradient: "linear-gradient(135deg, #10B981, #059669)" },
  { id: 120, name: "yogurt", image: "/aisles/Yogurt.avif", gradient: "linear-gradient(135deg, #F59E0B, #D97706)" },
  { id: 107, name: "chips pretzels", image: "/aisles/Chips Pretzels.avif", gradient: "linear-gradient(135deg, #EF4444, #DC2626)" },
  { id: 94, name: "tea", image: "/aisles/Tea.avif", gradient: "linear-gradient(135deg, #14B8A6, #0D9488)" },
  { id: 21, name: "packaged cheese", image: "/aisles/Packaged Cheese.webp", gradient: "linear-gradient(135deg, #F97316, #EA580C)" },
  { id: 38, name: "frozen meals", image: "/aisles/Frozen meals.avif", gradient: "linear-gradient(135deg, #3B82F6, #2563EB)" },
  { id: 61, name: "cookies cakes", image: "/aisles/Cookies cakes.avif", gradient: "linear-gradient(135deg, #A855F7, #9333EA)" },
  { id: 3, name: "energy granola bars", image: "/aisles/Energy Granola Bars.avif", gradient: "linear-gradient(135deg, #84CC16, #65A30D)" },
  { id: 22, name: "hair care", image: "/aisles/Hair Care.avif", gradient: "linear-gradient(135deg, #06B6D4, #0891B2)" },
  { id: 104, name: "spices seasonings", image: "/aisles/Spices Seasonings.avif", gradient: "linear-gradient(135deg, #F43F5E, #E11D48)" },
  { id: 98, name: "juice nectars", image: "/aisles/Juice Nectars.jpg", gradient: "linear-gradient(135deg, #FB923C, #EA580C)" },
  { id: 78, name: "crackers", image: "/aisles/Crackers.avif", gradient: "linear-gradient(135deg, #FBBF24, #D97706)" },
  { id: 69, name: "soup broth bouillon", image: "/aisles/Soup Broth Bouillon.avif", gradient: "linear-gradient(135deg, #22D3EE, #06B6D4)" },
  { id: 92, name: "baby food formula", image: "/aisles/Baby Food Formula.avif", gradient: "linear-gradient(135deg, #C084FC, #A855F7)" }
];

const capitalizeWords = (str) => {
  return str.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const Aisles = () => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="aisles-section">
      <div className="aisles-header">
        <h2 className="aisles-heading">Popular Aisles</h2>
        <p className="aisles-subtitle">Browse your favorite categories</p>
      </div>
      <div className="aisles-container">
        {TOP_AISLES.map((aisle) => (
          <Link
            key={aisle.id}
            to={`/aisle/${aisle.id}`}
            className="aisle-link"
            onMouseEnter={() => setHoveredId(aisle.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className={`aisle-card ${hoveredId === aisle.id ? 'hovered' : ''}`}>
              <div
                className="aisle-icon-container"
                style={{ background: aisle.gradient }}
              >
                <img 
                  src={aisle.image} 
                  alt={aisle.name} 
                  className="aisle-image" 
                  loading="lazy" 
                />
                <div className="aisle-icon-glow"></div>
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