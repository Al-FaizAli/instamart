import React from 'react';
import './ProductsGrid.css';
import ProductCard from '../ProductCard/ProductCard';

const ProductsGrid = ({ products, isInCart, handleAdd, handleRemove, loading }) => {
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading products...</p>
            </div>
        );
    }

    return (
        <div className="products-grid">
            {products.length > 0 ? (
                products.map((product) => (
                    <ProductCard
                        key={product.product_id}
                        product={product}
                        isInCart={isInCart}
                        handleAdd={handleAdd}
                        handleRemove={handleRemove}
                    />
                ))
            ) : (
                <p className="no-products">No products found</p>
            )}
        </div>
    );
};

export default ProductsGrid;