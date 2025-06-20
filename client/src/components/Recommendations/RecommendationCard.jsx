import React, { useState, useEffect } from 'react';
import './RecommendationCard.css';

const RecommendationCard = React.memo(({ product, type = 'past', onAddToCart }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState('/images/placeholder.jpg');

  useEffect(() => {
    let isMounted = true;
    setImageLoaded(false);

    const img = new Image();
    img.src = product.image;

    img.onload = () => {
      if (isMounted) {
        setCurrentImage(product.image);
        setImageLoaded(true);
      }
    };

    img.onerror = () => {
      if (isMounted) {
        setCurrentImage('/images/placeholder.jpg');
        setImageLoaded(true);
      }
    };

    return () => {
      isMounted = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [product.image]);

  return (
    <div className={`recommendation-card ${type}`}>
      <div className="product-image-container">
        {!imageLoaded && (
          <div className="image-skeleton">
            <div className="skeleton-animation"></div>
          </div>
        )}
        <img
          src={currentImage}
          alt={product.alt || product.name}
          className={`product-image ${imageLoaded ? 'loaded' : 'loading'}`}
        />
        {type === 'our' && (
          <span className="recommendation-badge">Recommended</span>
        )}
      </div>
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <div className="product-rating">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < Math.floor(product.rating) ? 'filled' : ''}
            >
              {i < Math.floor(product.rating) ? '★' : '☆'}
            </span>
          ))}
          <span className="rating-value">{product.rating.toFixed(1)}</span>
        </div>
        <p className="product-category">{product.category}</p>
        <button
          className="add-button"
          onClick={() => onAddToCart && onAddToCart(product)}
        >
          {type === 'past' ? 'Buy Again' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
});

export default RecommendationCard;