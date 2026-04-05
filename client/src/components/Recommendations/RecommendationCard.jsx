import React, { useState, useEffect } from 'react';
import './RecommendationCard.css';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../../utils/productHelpers';

const RecommendationCard = React.memo(({ product, type = 'past', badgeText, onAddToCart }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState(PRODUCT_PLACEHOLDER_IMAGE);
  const imageSrc = product.image_link || product.image || PRODUCT_PLACEHOLDER_IMAGE;
  const rating = Number(product.rating) || 4.2;

  useEffect(() => {
    let isMounted = true;
    setImageLoaded(false);

    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      if (isMounted) {
        setCurrentImage(imageSrc);
        setImageLoaded(true);
      }
    };

    img.onerror = () => {
      if (isMounted) {
        setCurrentImage(PRODUCT_PLACEHOLDER_IMAGE);
        setImageLoaded(true);
      }
    };

    return () => {
      isMounted = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc]);

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
          <span className="recommendation-badge">{badgeText || 'Recommended'}</span>
        )}
      </div>
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${(Number(product.price) || 0).toFixed(2)}</p>
        <div className="product-rating">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < Math.floor(rating) ? 'filled' : ''}
            >
              {i < Math.floor(rating) ? '\u2605' : '\u2606'}
            </span>
          ))}
          <span className="rating-value">{rating.toFixed(1)}</span>
        </div>
        <p className="product-category">{product.category}</p>
        <button
          className="add-button"
          onClick={() => onAddToCart && onAddToCart(product)}
          disabled={!product.product_id}
        >
          {type === 'past' ? 'Buy Again' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
});

export default RecommendationCard;
