import React from 'react';
import './RecommendationCard.css';

const RecommendationCard = ({ product, type = 'past' }) => {
  return (
    <div className={`recommendation-card ${type}`}>
      <img
        src={product.urls?.regular || '/images/placeholder.jpg'}
        alt={product.name}
        className="product-image"
      />
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <div className="product-rating">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < Math.floor(product.rating) ? 'filled' : ''}>
              {i < Math.floor(product.rating) ? '★' : '☆'}
            </span>
          ))}
        </div>
        <p className="product-category">{product.category}</p>
        <button className="add-button">Add</button>
      </div>
    </div>
  );
};

export default RecommendationCard;