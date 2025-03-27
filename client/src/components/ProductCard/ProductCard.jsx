import React from 'react';
import './ProductCard.css';

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
      </div>
      <h3 className="product-name">{product.product_name}</h3>
      <p className="product-price">${product.price || '10'}</p>
      <p className="product-rating">Rating: {product.rating} ★</p>
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
            ADD
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;