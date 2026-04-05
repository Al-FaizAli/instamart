import React, { useState, useEffect } from 'react';
import './ProductCard.css';
import { FiShoppingCart } from 'react-icons/fi';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../../utils/productHelpers';

const ProductCard = React.memo(({ product, isInCart, handleAdd, handleRemove, badgeText }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState(PRODUCT_PLACEHOLDER_IMAGE);
  
  const imageSrc = product.image_link || product.image || PRODUCT_PLACEHOLDER_IMAGE;
  const productDescription = product.catalog_content || product.description || product.category;
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
    <div className="product-card">
      <div className="image-container">
        {!imageLoaded && (
          <div className="image-skeleton">
            <div className="skeleton-animation"></div>
          </div>
        )}
        <img
          src={currentImage}
          alt={product.product_name || product.name || product.alt}
          className={`product-image ${imageLoaded ? 'loaded' : 'loading'}`}
        />
        {(badgeText || product.onSale) && (
          <span className="badge">
            {badgeText ? badgeText : 'SALE'}
          </span>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.product_name || product.name}</h3>
        {productDescription && <p className="product-description">{productDescription}</p>}
        <p className="product-price">${(Number(product.price) || 0).toFixed(2)}</p>
        <div className="product-rating">
          <span className="rating-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={i < Math.floor(rating) ? 'filled' : ''}
              >
                {i < Math.floor(rating) ? '\u2605' : '\u2606'}
              </span>
            ))}
          </span>
          <span className="rating-value">{rating.toFixed(1)}</span>
        </div>
        <div className="product-actions">
          {isInCart && isInCart(product.product_id) ? (
            <button
              className="remove-button"
              onClick={() => handleRemove(product.product_id)}
            >
              REMOVE
            </button>
          ) : (
            <button
              className="add-button"
              onClick={() => handleAdd(product.product_id)}
              disabled={!product.product_id}
            >
              <FiShoppingCart /> ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
