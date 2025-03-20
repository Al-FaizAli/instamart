import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Products.css';

const ProductsPage = () => {
    const { department } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    const generateProductDetails = (product) => {
        const prices = [74, 80, 16, 25, 28];
        const quantities = ['1 ltr', '200 ml', '250 ml', '450 ml'];
        const ratings = [4.0, 4.5, 3.5, 5.0];

        return {
            ...product,
            price: prices[Math.floor(Math.random() * prices.length)],
            quantity: quantities[Math.floor(Math.random() * quantities.length)],
            rating: ratings[Math.floor(Math.random() * ratings.length)],
        };
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `https://api.unsplash.com/search/photos?query=${department}&client_id=${ACCESS_KEY}&per_page=20`
            );

            if (response.data.results.length > 0) {
                const productsWithDetails = response.data.results.map((product) =>
                    generateProductDetails(product)
                );
                setProducts(productsWithDetails);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error(`Error fetching products for ${department}:`, error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [department]);

    const handleAdd = (productId) => {
        console.log(`Added product with ID: ${productId}`);
    };

    const handleRemove = (productId) => {
        console.log(`Removed product with ID: ${productId}`);
    };

    return (
        <div className="products-page">
            <h1>{department}</h1>
            {loading ? (
                <p className="loading-message">Loading products...</p>
            ) : (
                <div className="products-container">
                    {products.map((product, index) => (
                        <div key={index} className="product-card">
                            <img
                                src={product.urls.regular}
                                alt={product.alt_description}
                                className="product-image"
                            />
                            <h3 className="product-name">{product.alt_description || 'No description'}</h3>
                            {/* <p className="product-quantity">{product.quantity}</p> */}
                            <p className="product-price">${product.price}</p>
                            <p className="product-rating">Rating: {product.rating} ★</p>
                            <div className="product-actions">
                                <button
                                    className="add-button"
                                    onClick={() => handleAdd(product.id)}
                                >
                                    ADD
                                </button>
                                <button
                                    className="remove-button"
                                    onClick={() => handleRemove(product.id)}
                                >
                                    REMOVE
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductsPage;