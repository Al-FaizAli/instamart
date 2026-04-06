import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ProductCard.css';
import { FiShoppingCart } from 'react-icons/fi';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../../utils/productHelpers';

const ProductCard = React.memo(({ product, getCartQuantity, handleAdd, handleRemove, handleUpdateQuantity, badgeText }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState(PRODUCT_PLACEHOLDER_IMAGE);
  const [showDescription, setShowDescription] = useState(false);
  
  const imageSrc = product.image_link || product.image || PRODUCT_PLACEHOLDER_IMAGE;
  const productDescription = product.catalog_content || product.description || product.category;
  const rating = Number(product.rating) || 4.2;

  const formatDescription = (desc) => {
    if (!desc) return null;
    
    const splitRegex = /(Bullet Point(?:\s+\d*)?:|Item Name:|Product Description:|Value:|Unit:)/i;
    const hasPattern = splitRegex.test(desc);
    
    if (hasPattern) {
      const parts = desc.split(splitRegex).filter(Boolean);
      const formattedItems = [];
      
      for(let i = 0; i < parts.length; i++) {
        if (parts[i].match(splitRegex)) {
           const content = parts[i+1] || '';
           if (content.trim()) {
              formattedItems.push(content.trim());
           }
           i++; 
        } else if (parts[i].trim()) {
           formattedItems.push(parts[i].trim());
        }
      }
      
      return (
        <React.Fragment>
          <h4 className="description-heading">Description</h4>
          <ul className="formatted-description">
            {formattedItems.map((item, idx) => (
               <li key={idx}>
                 {item}
               </li>
            ))}
          </ul>
        </React.Fragment>
      );
    }
    
    return (
      <React.Fragment>
        <h4 className="description-heading">Description</h4>
        {desc.split('\n').map((para, idx) => (
          <p key={idx} className="standard-description">{para}</p>
        ))}
      </React.Fragment>
    );
  };

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
        {productDescription && (
          <div className="product-description-container">
            <button 
              className="toggle-description-btn" 
              onClick={() => setShowDescription(true)}
            >
              View Description
            </button>
          </div>
        )}
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
          {getCartQuantity && getCartQuantity(product.product_id) > 0 ? (
            <div className="quantity-selector">
              <button
                className="qty-btn"
                onClick={() => handleUpdateQuantity(product.product_id, getCartQuantity(product.product_id) - 1)}
              >
                -
              </button>
              <span className="qty-value">{getCartQuantity(product.product_id)}</span>
              <button
                className="qty-btn"
                onClick={() => handleUpdateQuantity(product.product_id, getCartQuantity(product.product_id) + 1)}
              >
                +
              </button>
            </div>
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

      {showDescription && createPortal(
        <div className="description-modal-overlay" onClick={() => setShowDescription(false)}>
          <div className="description-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{product.product_name || product.name}</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowDescription(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body scrollable">
               {formatDescription(productDescription)}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

export default ProductCard;
