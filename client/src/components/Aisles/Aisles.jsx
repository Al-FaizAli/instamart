import { useState } from "react";
import { Link } from "react-router-dom";
import "./Aisles.css";

const TOP_AISLES = [
  { id: 45, name: "candy chocolate", emoji: "🍫", gradient: "linear-gradient(135deg, #8B5CF6, #6D28D9)" },
  { id: 37, name: "ice cream ice", emoji: "🍦", gradient: "linear-gradient(135deg, #EC4899, #DB2777)" },
  { id: 47, name: "vitamins supplements", emoji: "💊", gradient: "linear-gradient(135deg, #10B981, #059669)" },
  { id: 120, name: "yogurt", emoji: "🥛", gradient: "linear-gradient(135deg, #F59E0B, #D97706)" },
  { id: 107, name: "chips pretzels", emoji: "🥨", gradient: "linear-gradient(135deg, #EF4444, #DC2626)" },
  { id: 94, name: "tea", emoji: "🍵", gradient: "linear-gradient(135deg, #14B8A6, #0D9488)" },
  { id: 21, name: "packaged cheese", emoji: "🧀", gradient: "linear-gradient(135deg, #F97316, #EA580C)" },
  { id: 38, name: "frozen meals", emoji: "🧊", gradient: "linear-gradient(135deg, #3B82F6, #2563EB)" },
  { id: 61, name: "cookies cakes", emoji: "🍪", gradient: "linear-gradient(135deg, #A855F7, #9333EA)" },
  { id: 3, name: "energy granola bars", emoji: "🥜", gradient: "linear-gradient(135deg, #84CC16, #65A30D)" },
  { id: 22, name: "hair care", emoji: "💆", gradient: "linear-gradient(135deg, #06B6D4, #0891B2)" },
  { id: 104, name: "spices seasonings", emoji: "🌶️", gradient: "linear-gradient(135deg, #F43F5E, #E11D48)" },
  { id: 98, name: "juice nectars", emoji: "🧃", gradient: "linear-gradient(135deg, #FB923C, #EA580C)" },
  { id: 78, name: "crackers", emoji: "🍘", gradient: "linear-gradient(135deg, #FBBF24, #D97706)" },
  { id: 69, name: "soup broth bouillon", emoji: "🍲", gradient: "linear-gradient(135deg, #22D3EE, #06B6D4)" },
  { id: 92, name: "baby food formula", emoji: "🍼", gradient: "linear-gradient(135deg, #C084FC, #A855F7)" }
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
                <span className="aisle-emoji" role="img" aria-label={aisle.name}>
                  {aisle.emoji}
                </span>
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