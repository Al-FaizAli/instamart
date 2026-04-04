import React from 'react';
import './ProductCard.css';
import { FiShoppingCart } from 'react-icons/fi';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../../utils/productHelpers';

const ProductCard = ({ product, isInCart, handleAdd, handleRemove }) => {
  const imageSrc = product.image_link || product.image || PRODUCT_PLACEHOLDER_IMAGE;
  const productDescription = product.catalog_content || product.description;
  const rating = Number(product.rating) || 4.2;

  return (
    <div className="product-card">
      <div className="image-container">
        <img
          src={imageSrc}
          alt={product.product_name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PRODUCT_PLACEHOLDER_IMAGE;
          }}
        />
        {product.onSale && <span className="badge">SALE</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.product_name}</h3>
        {productDescription && <p className="product-description">{productDescription}</p>}
        <p className="product-price">${(Number(product.price) || 0).toFixed(2)}</p>
        <div className="product-rating">
          <span className="rating-stars">
            {'\u2605'.repeat(Math.floor(rating))}
            {'\u2606'.repeat(5 - Math.floor(rating))}
          </span>
          <span className="rating-value">{rating.toFixed(1)}</span>
        </div>
        <div className="product-actions">
          {isInCart(product.product_id) ? (
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
            >
              <FiShoppingCart /> ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
