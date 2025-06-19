import React from 'react';
import './ProductCard.css';
import { FiShoppingCart } from 'react-icons/fi';

const ProductCard = ({ product, isInCart, handleAdd, handleRemove }) => {
  return (
    <div className="product-card">
      <div className="image-container">
        <img
          src={product.image}
          alt={product.product_name}
          className="product-image"
          loading="lazy"
        />
        {product.onSale && <span className="badge">SALE</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.product_name}</h3>
        <p className="product-price">${product.price?.toFixed(2) || '10.00'}</p>
        <div className="product-rating">
          <span className="rating-stars">
            {'★'.repeat(Math.floor(product.rating))}
            {'☆'.repeat(5 - Math.floor(product.rating))}
          </span>
          <span className="rating-value">{product.rating}</span>
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